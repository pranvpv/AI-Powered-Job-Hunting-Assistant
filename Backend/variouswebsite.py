import requests
from bs4 import BeautifulSoup
import json
import logging
import os
import PyPDF2
from langchain_core.tools import tool
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from typing import List, Dict

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


class NaukriScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }

    def scrape_naukri_jobs(self):
        """
        Scrapes Naukri public job search listings for given keywords and location.
        """
        search_url = "https://www.naukri.com/jobs-in-bengaluru-bangalore"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
        }
        
        try:
            logging.info(f"Accessing URL: {search_url}")
            response = requests.get(search_url, headers=headers, timeout=15)
            response.raise_for_status()
            logging.info(f"Status Code: {response.status_code}")
        except requests.exceptions.RequestException as e:
            logging.error(f"Error fetching the URL: {e}")
            return []

        soup = BeautifulSoup(response.text, 'html.parser')
        job_list = []
        
        # Method 1: Direct DOM extraction (matching the screenshot)
        cards = soup.find_all('div', class_='srp-jobtuple-wrapper')
        logging.info(f"Method 1 found {len(cards)} cards.")
        
        for card in cards:
            job = {}
            title_tag = card.find('a', class_='title')
            if title_tag:
                job['title'] = title_tag.get_text(strip=True)
                job['link'] = title_tag.get('href')
                if job['link'] and not job['link'].startswith('http'):
                     job['link'] = 'https://www.naukri.com' + job['link']
            
            company_tag = card.find('a', class_='comp-name') or card.find('span', class_='comp-name')
            if company_tag:
                job['company'] = company_tag.get_text(strip=True)
                
            if job.get('title'):
                job_list.append(job)
        
        # Method 2: JSON-LD
        if not job_list:
            logging.info("Method 1 failed, trying Method 2 (JSON-LD)...")
            scripts = soup.find_all('script', type='application/ld+json')
            for script in scripts:
                try:
                    data = json.loads(script.string)
                    # Implementation same as before...
                    if isinstance(data, list):
                        for item in data:
                            if item.get('@type') == 'JobPosting':
                                job_list.append({'title': item.get('title'), 'company': item.get('hiringOrganization', {}).get('name'), 'link': item.get('url')})
                except: continue

        # Method 3: Search for initial state in script tags (Common in React/Next.js)
        if not job_list:
            logging.info("Method 2 failed, trying Method 3 (Initial State)...")
            all_scripts = soup.find_all('script')
            for s in all_scripts:
                if s.string and ('window._initialState' in s.string or 'PRELOADED_STATE' in s.string):
                    logging.info("Found Initial State script tag.")
                    # This would need complex regex/parsing, but let's try a simple approach
                    # for now to see if we can at least find the data
                    break

        # Method 4: Search for __NEXT_DATA__ (Next.js)
        if not job_list:
            logging.info("Method 3 failed, trying Method 4 (__NEXT_DATA__)...")
            script = soup.find('script', id='__NEXT_DATA__')
            if script:
                try:
                    data = json.loads(script.string)
                    # Path for Naukri's job data in __NEXT_DATA__
                    # Note: Path can vary, but this is a common one
                    search_data = data.get('props', {}).get('pageProps', {}).get('searchPageData', {})
                    job_data = search_data.get('state', {}).get('jobTupleProps', [])
                    if not job_data:
                         job_data = data.get('props', {}).get('pageProps', {}).get('initialState', {}).get('srpData', {}).get('jobList', [])

                    for item in job_data:
                        title = item.get('title') or item.get('jobTitle')
                        if title:
                            job_list.append({
                                'title': title,
                                'company': item.get('companyName') or item.get('company', {}).get('name'),
                                'link': item.get('jdURL') if item.get('jdURL', '').startswith('http') else 'https://www.naukri.com' + item.get('jdURL') if item.get('jdURL') else None
                            })
                    logging.info(f"Method 4 found {len(job_list)} jobs.")
                except Exception as e:
                    logging.error(f"Method 4 failed: {e}")

        if not job_list:
             print("\nDEBUG: Snippet of HTML body received (first 1000 chars):")
             print(soup.body.get_text()[:1000] if soup.body else "No body found")

        return job_list

if __name__ == "__main__":
    scraper = NaukriScraper()
    jobs = scraper.scrape_naukri_jobs()
    print("\n" + "="*60)
    print(f"SEARCH RESULTS: {len(jobs)} JOBS ACQUIRED")
    print("="*60)
    if jobs:
        for i, job in enumerate(jobs[:10], 1):
            title = job.get('title', 'N/A')
            company = job.get('company', 'N/A')
            print(f"{i:2}. {title[:50]:<50} | {company}")
    else:
        print("No jobs found. The site might be blocking or selectors might be outdated.")
    print("="*60 + "\n")