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

class LinkedInScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }

    def scrape_linkedin_jobs(self, keywords: str, location: str) -> List[Dict]:
        """
        Scrapes LinkedIn public job search listings for given keywords and location.
        """
        search_url = f"https://www.linkedin.com/jobs/search?keywords={requests.utils.quote(keywords)}&location={requests.utils.quote(location)}"
        logging.info(f"Scraping LinkedIn jobs from: {search_url}")
        
        try:
            response = requests.get(search_url, headers=self.headers, timeout=10)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            logging.error(f"Error fetching the URL: {e}")
            return []

        soup = BeautifulSoup(response.text, 'html.parser')
        job_list = []

        # Find job cards using the classes seen in the DOM screenshot
        cards = soup.find_all('div', class_='job-search-card')
        
        for card in cards:
            job = {}
            
            # Title and Link (base-card__full-link)
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
 

            # Metadata (e.g., salary/benefits)
            metadata_div = card.find('div', class_='base-search-card__metadata')
            if metadata_div:
                salary_tag = metadata_div.find('span', class_='job-search-card__salary-info')
                if salary_tag:
                    job['salary'] = salary_tag.get_text(strip=True)

            if job.get('title'):
                job_list.append(job)
        return job_list
            
    def get_job_description(self, job_url: str) -> str:
        """
        Navigates to the job detail page and extracts the description.
        """
        logging.info(f"Fetching description from: {job_url}")
        try:
            import time
            import random
            time.sleep(random.uniform(1, 2))
            
            response = requests.get(job_url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Using the expandable-text-box data attribute from the screenshot
            desc_tag = soup.find('span', {'data-test': 'expandable-text-box'})
            
            if not desc_tag:
                desc_tag = soup.find('div', class_='description__text') or \
                           soup.find('div', class_='show-more-less-html__markup')
            
            if desc_tag:
                return desc_tag.get_text(separator="\n", strip=True)
            
            return "Detailed description not found."
        except Exception as e:
            logging.error(f"Error fetching description: {e}")
            return f"Error fetching description: {e}"

    def scrape_linkedin_jobs_direct(self, search_url: str) -> List[Dict]:
        """
        Directly scrapes the provided LinkedIn URL.
        """
        logging.info(f"Direct scraping LinkedIn from: {search_url}")
        try:
            response = requests.get(search_url, headers=self.headers, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            job_list = []
            cards = soup.find_all('div', class_='job-search-card')
            for card in cards:
                job = {}
                link_tag = card.find('a', class_='base-card__full-link')
                if link_tag:
                    job['title'] = link_tag.get_text(strip=True)
                    job['link'] = link_tag.get('href')
                info_div = card.find('div', class_='base-search-card__info')
                if info_div:
                    company_tag = info_div.find('h4', class_='base-search-card__subtitle')
                    location_tag = info_div.find('span', class_='job-search-card__location')
                    if company_tag: job['company'] = company_tag.get_text(strip=True)
                    if location_tag: job['location'] = location_tag.get_text(strip=True)
                if job.get('title'):
                    job_list.append(job)
            return job_list
        except Exception as e:
            logging.error(f"Direct scrape error: {e}")
            return []

class ResumeProcessor:
    def __init__(self, api_key: str):
        self.api_key = api_key

    def extract_text(self, pdf_path: str) -> str:
        if not os.path.exists(pdf_path):
            return ""
        try:
            text = ""
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            logging.error(f"PDF extraction error: {e}")
            return ""

    def summarize(self, text: str) -> str:
        if not text:
            return "Resume text is empty or could not be extracted."
        try:
            llm = ChatGroq(
                api_key=self.api_key,
                model="llama-3.1-8b-instant",
                temperature=0.3
            )
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are a professional HR assistant. Provide a concise summary of the resume highlighting key skills, experience, and education only."),
                ("user", "Summarize this resume:\n\n{text}")
            ])
            chain = prompt | llm
            return chain.invoke({"text": text}).content
        except Exception as e:
            return f"Summarization error: {e}"

@tool
def search_linkedin_by_url(search_url: str) -> str:
    """
    Scrapes LinkedIn jobs directly from a provided search URL.
    Use this if you have a specific LinkedIn search URL with filters.
    """
    scraper = LinkedInScraper()
    jobs = scraper.scrape_linkedin_jobs_direct(search_url)
    if not jobs:
        return "No jobs found at the provided URL."
    return json.dumps(jobs, indent=2)

@tool
def search_linkedin_jobs(keywords: str, location: str) -> str:
    """
    Search for jobs on LinkedIn using keywords and location.
    Returns a list of job summaries including title, company, location, and link.
    """
    scraper = LinkedInScraper()
    jobs = scraper.scrape_linkedin_jobs(keywords, location)
    if not jobs:
        return f"No jobs found for '{keywords}' in '{location}'."
    return json.dumps(jobs, indent=2)

@tool
def get_linkedin_job_details(job_url: str) -> str:
    """
    Fetches the full job description and requirements for a specific LinkedIn job URL.
    Use this after finding a job link with search_linkedin_jobs to get more details.
    """
    scraper = LinkedInScraper()
    return scraper.get_job_description(job_url)

@tool
def search_web(query: str) -> str:
    """
    Performs a general Google/DuckDuckGo web search.
    Useful for finding company info or newest job trends.
    """
    search = DuckDuckGoSearchRun()
    return search.run(query)

@tool
def summarize_resume_tool(pdf_path: str) -> str:
    """
    Extracts text from a local PDF resume and generates a professional PR-focused summary.
    Provide the full absolute path to the PDF file.
    """
    # Using the key provided in previous context
    api_key = "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"
    processor = ResumeProcessor(api_key)
    text = processor.extract_text(pdf_path)
    return processor.summarize(text)

if __name__ == "__main__":
    # Test the tools locally
    print("Testing LinkedIn Scraper Tool...")
    results = search_linkedin_jobs.invoke({"keywords": "Data Analyst", "location": "Kochi"})
    print("Search results acquired.")
    
    # Test detail fetching if we found results
    first_job_url = None
    try:
        first_job_url = json.loads(results)[0]['link']
        print(f"\nTesting Detail Fetcher for: {first_job_url}")
        details = get_linkedin_job_details.invoke({"job_url": first_job_url})
        print(f"Details acquired (first 200 chars): {details[:200]}...")
    except Exception as e:
        print(f"Could not test detail fetcher: {e}")

    # Test resume summary tool
    resume_path = "D:\\Lienkdn\\Backend\\Resume_Pranav.pdf"
    if os.path.exists(resume_path):
        print(f"\nTesting Resume Summarizer Tool for: {resume_path}")
        summary = summarize_resume_tool.invoke({"pdf_path": resume_path})
        print("Summary generated successfully.")
        print(summary)
