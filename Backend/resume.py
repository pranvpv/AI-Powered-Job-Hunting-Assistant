import PyPDF2
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def extract_text_from_pdf(pdf_path):
    """
    Extracts all text content from a given PDF file.
    """
    if not os.path.exists(pdf_path):
        logging.error(f"File not found: {pdf_path}")
        return None

    try:
        logging.info(f"Extracting text from: {pdf_path}")
        text = ""
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            num_pages = len(reader.pages)
            logging.info(f"Total pages: {num_pages}")
            
            for page_num in range(num_pages):
                page = reader.pages[page_num]
                text += page.extract_text() + "\n"
        
        return text.strip()
    except Exception as e:
        logging.error(f"Error extracting PDF: {e}")
        return None

if __name__ == "__main__":
    # Example usage
    # You can provide a path to a PDF file here to test it
    pdf_file = "D:\\Lienkdn\\Backend\\Resume_Pranav.pdf"
    
    if os.path.exists(pdf_file):
        resume_text = extract_text_from_pdf(pdf_file)
        if resume_text:
            print("--- Extracted Resume Text ---")
            print(resume_text[:1000]) # Print first 1000 characters
            
            # Save to text file for reference
            with open("resume_extracted.txt", "w", encoding="utf-8") as f:
                f.write(resume_text)
            print("\nFull text saved to resume_extracted.txt")
    else:
        print(f"Please place a file named '{pdf_file}' in the directory to test.")
