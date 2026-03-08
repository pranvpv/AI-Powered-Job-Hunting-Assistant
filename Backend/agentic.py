import os
import json
import logging
from typing import TypedDict, Annotated, List, Union
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
# Import tools from our lang.py module
from lang import search_web, search_linkedin_jobs, get_linkedin_job_details, summarize_resume_tool, search_linkedin_by_url

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Define the State for our multi-agent system
class AgentState(TypedDict):
    resume_path: str
    location: str
    resume_summary: str
    search_keywords: List[str]
    search_urls: List[str]
    job_listings: List[dict]
    final_analysis: str
    error: str

def resume_analyzer_node(state: AgentState):
    """
    Agent 1: Analyzes the PDF and generates a concise summary of skills.
    """
    logging.info("Agent 1: Analyzing resume...")
    try:
        # We invoke the tool directly to get the summary
        summary = summarize_resume_tool.invoke({"pdf_path": state["resume_path"]})
        return {"resume_summary": summary}
    except Exception as e:
        return {"error": f"Resume analysis failed: {e}"}

def keyword_generator_node(state: AgentState):
    """
    Agent 2: Generates optimized job search keywords based on the resume summary.
    """
    logging.info("Agent 2: Generating search keywords...")
    llm = ChatGroq(
        api_key="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",
        model="llama-3.1-8b-instant",
        temperature=0
    )
    prompt = (
        f"Based on this resume summary: {state['resume_summary']}\n"
        f"The user is specifically targeting jobs in the location: {state.get('location', 'India')}. "
        "Generate exactly 3 distinct professional job titles for a LinkedIn search that would be highly relevant in this region. "
        "IMPORTANT: Return ONLY the role names (e.g. 'Software Engineer', 'Data Scientist'). Do NOT include city or state names in the final strings, as the location will be handled by a separate filter. "
        "Return ONLY a comma-separated list. No preamble, no introductory text, no numbered lists."
    )
    response = llm.invoke(prompt)
    keywords = [k.strip() for k in response.content.split(",")]
    logging.info(f"Generated keywords: {keywords}")
    return {"search_keywords": keywords}

def url_framer_node(state: AgentState):
    """
    Agent 3: Constructs legitimate LinkedIn search URLs from keywords and location.
    """
    logging.info("Agent 3: Framing search URLs...")
    import urllib.parse
    
    base_url = "https://www.linkedin.com/jobs/search?"
    location = state.get("location", "India")
    logging.info(f"DEBUG: Framer using location: {location}")
    search_urls = []
    
    for kw in state["search_keywords"][:3]:
        params = {
            "keywords": kw,
            "location": location,
            "trk": "public_jobs_jobs-search-bar_search-submit",
            "position": "1",
            "pageNum": "0"
        }
        url = base_url + urllib.parse.urlencode(params)
        search_urls.append(url)
    
    logging.info(f"Framed {len(search_urls)} URLs.")
    return {"search_urls": search_urls}

def job_searcher_node(state: AgentState):
    """
    Agent 4: Uses the framed URLs to fetch jobs from LinkedIn.
    """
    logging.info("Agent 4: Searching for matching jobs...")
    all_jobs = []
    
    for url in state["search_urls"][:2]: # Search top 2 URLs
        try:
            results_json = search_linkedin_by_url.invoke({"search_url": url})
            results = json.loads(results_json)
            if isinstance(results, list):
                logging.info(f"Found {len(results)} jobs at URL: {url}")
                all_jobs.extend(results)
        except Exception as e:
            logging.error(f"Search at URL failed: {e}")
            
    return {"job_listings": all_jobs[:10]}

def synthesizer_node(state: AgentState):
    """
    Agent 4: Compares the resume against found jobs and provides a final recommendation.
    """
    logging.info("Agent 4: Synthesizing final results...")
    if not state["job_listings"]:
        return {"final_analysis": "No matching jobs found on LinkedIn."}

    llm = ChatGroq(
        api_key="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",
        model="llama-3.3-70b-versatile",
        temperature=0
    )
    
    jobs_text = json.dumps(state["job_listings"][:3], indent=2) # Take top 3 for analysis
    prompt = (
        f"TARGET LOCATION: {state.get('location', 'India')}\n\n"
        f"USER RESUME SUMMARY:\n{state['resume_summary']}\n\n"
        f"MATCHING JOBS FOUND IN {state.get('location', 'India')}:\n{jobs_text}\n\n"
        "Please analyze these jobs and for each one, provide: \n"
        "1. Why it's a good fit for the candidate in this specific location. \n"
        "2. Any skill gaps. \n"
        "3. Final 'Match Score' out of 100.\n"
        "4. The link for that job.\n"
        "Be professional and encouraging. Mention the city/region when appropriate."
    )
    response = llm.invoke(prompt)
    return {"final_analysis": response.content}

def run_multi_agent_workflow(resume_path: str, location: str):
    # Build the Graph
    workflow = StateGraph(AgentState)

    # Add Nodes
    workflow.add_node("analyze_resume", resume_analyzer_node)
    workflow.add_node("generate_keywords", keyword_generator_node)
    workflow.add_node("frame_urls", url_framer_node)
    workflow.add_node("search_jobs", job_searcher_node)
    workflow.add_node("synthesize", synthesizer_node)

    # Add Edges (Linear workflow)
    workflow.set_entry_point("analyze_resume")
    workflow.add_edge("analyze_resume", "generate_keywords")
    workflow.add_edge("generate_keywords", "frame_urls")
    workflow.add_edge("frame_urls", "search_jobs")
    workflow.add_edge("search_jobs", "synthesize")
    workflow.add_edge("synthesize", END)

    # Compile the Graph
    app = workflow.compile()

    # Initial State
    initial_state = {
        "resume_path": resume_path,
        "location": location,
        "resume_summary": "",
        "search_keywords": [],
        "search_urls": [],
        "job_listings": [],
        "final_analysis": "",
        "error": ""
    }

    logging.info("--- Starting Multi-Agent Workflow ---")
    result = app.invoke(initial_state)
    
    if result.get("error"):
        logging.error(f"Workflow Error: {result['error']}")
    else:
        logging.info("--- Workflow Completed Successfully ---")
        
    return result

def run_agent(resume_path: str, location: str):
    """
    Convenience function for external callers (like API).
    """
    return run_multi_agent_workflow(resume_path, location)

if __name__ == "__main__":
    resume_file = "D:/Lienkdn/Backend/Resume_Pranav.pdf"
    target_location = "Bangalore"
    run_multi_agent_workflow(resume_file, target_location)