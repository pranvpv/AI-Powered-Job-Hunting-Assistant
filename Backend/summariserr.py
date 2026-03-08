import os
import logging
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def summarize_resume(file_path):
    """
    Reads the extracted resume text and generates a professional summary using Groq.
    """
    if not os.path.exists(file_path):
        logging.error(f"Extracted text file not found: {file_path}")
        return "File not found. Please run resume.py first."

    try:
        logging.info(f"Reading text from: {file_path}")
        with open(file_path, "r", encoding="utf-8") as f:
            resume_content = f.read()

        if not resume_content.strip():
            return "Resume content is empty."

        # Initialize Groq LLM
        llm = ChatGroq(
            api_key="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",
            model="llama-3.1-8b-instant",  # Using a fast model for summary
            temperature=0.5
        )

        # Create Prompt
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a professional HR assistant. Your task is to provide a concise, high-level summary of a candidate's resume, highlighting their key skills, experience, and education only. Don't need unwanted details"),
            ("user", "Please summarize this resume content:\n\n{content}")
        ])

        logging.info("Generating summary using LLM...")
        chain = prompt | llm
        response = chain.invoke({"content": resume_content})

        return response.content

    except Exception as e:
        logging.error(f"Error during summarization: {e}")
        return f"An error occurred: {e}"

if __name__ == "__main__":
    extracted_text_file = "resume_extracted.txt"
    
    summary = summarize_resume(extracted_text_file)
    
    print("\n" + "="*50)
    print("PROfESSIONAL RESUME SUMMARY")
    print("="*50)
    print(summary)
    print("="*50 + "\n")
    
    # Save the summary to a file
    with open("resume_summary.txt", "w", encoding="utf-8") as f:
        f.write(summary)
    logging.info("Summary saved to resume_summary.txt")
