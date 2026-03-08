import requests
from bs4 import BeautifulSoup
import json
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class LinkedInScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }

    def scrape_jobs(self, search_url):
        logging.info(f"Fetching jobs from: {search_url}")
        try:
            response = requests.get(search_url, headers=self.headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            logging.error(f"Error fetching the URL: {e}")
            return []

        soup = BeautifulSoup(response.text, 'html.parser')
        job_list = []

        # Based on the DOM structure provided in the screenshot
        cards = soup.find_all('div', class_='job-search-card')
        
        for card in cards:
            job = {}
            
            # Title and Link
            link_tag = card.find('a', class_='base-card__full-link')
            if link_tag:
                job['title'] = link_tag.get_text(strip=True)
                job['link'] = link_tag.get('href')
            
            # Company Info
            info_div = card.find('div', class_='base-search-card__info')
            if info_div:
                company_tag = info_div.find('h4', class_='base-search-card__subtitle')
                location_tag = info_div.find('span', class_='job-search-card__location')
                
                if company_tag:
                    job['company'] = company_tag.get_text(strip=True)
                if location_tag:
                    job['location'] = location_tag.get_text(strip=True)
            
            # Date Posted
            time_tag = card.find('time', class_='job-search-card__listdate') or card.find('time', class_='job-search-card__listdate--new')
            if time_tag:
                job['date_posted'] = time_tag.get('datetime')
                job['date_posted_text'] = time_tag.get_text(strip=True)

            # Metadata (e.g., salary info if available)
            metadata_div = card.find('div', class_='base-search-card__metadata')
            if metadata_div:
                salary_tag = metadata_div.find('span', class_='job-search-card__salary-info')
                if salary_tag:
                    job['salary'] = salary_tag.get_text(strip=True)

            job_list.append(job)
            
        logging.info(f"Found {len(job_list)} jobs.")
        return job_list

    def get_job_description(self, job_url):
        """
        Navigates to the job detail page and extracts the description.
        """
        logging.info(f"Fetching description from: {job_url}")
        try:
            # Adding a small randomized delay to look more human
            import time
            import random
            time.sleep(random.uniform(1, 3))
            
            response = requests.get(job_url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Based on the user provided screenshot: <span data-test="expandable-text-box">
            desc_tag = soup.find('span', {'data-test': 'expandable-text-box'})
            
            if not desc_tag:
                # Fallback for common LinkedIn public job page selectors
                desc_tag = soup.find('div', class_='description__text') or \
                           soup.find('div', class_='show-more-less-html__markup') or \
                           soup.find('section', class_='description')
            
            if desc_tag:
                return desc_tag.get_text(separator="\n", strip=True)
            
            return "Description not found."
            
        except Exception as e:
            logging.error(f"Error fetching description: {e}")
            return "Error fetching description."

if __name__ == "__main__":
    # Example LinkedIn public job search URL
    # Replace with a real search URL if needed
    url = "https://www.linkedin.com/jobs/search?keywords=Data%20Analyst&location=India"
    
    scraper = LinkedInScraper()
    jobs = scraper.scrape_jobs(url)
    
    # Enrich the first few jobs with their descriptions (to avoid heavy rate limiting)
    num_to_enrich = min(3, len(jobs))
    logging.info(f"Enriching top {num_to_enrich} jobs with descriptions...")
    
    for i in range(num_to_enrich):
        jobs[i]['description'] = scraper.get_job_description(jobs[i]['link'])
    
    # Save to JSON
    with open('jobs.json', 'w', encoding='utf-8') as f:
        json.dump(jobs, f, indent=4, ensure_ascii=False)
    
    print(f"Scraped {len(jobs)} jobs. Top {num_to_enrich} enriched with descriptions.")
    print(json.dumps(jobs[:num_to_enrich], indent=2))
