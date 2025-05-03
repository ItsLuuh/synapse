import json
from web_scraper import WebScraper
from nsn_engine import DigitalNeuron, BrainSection

class NSNWebIntegration:
    def __init__(self, physics_section, biology_section):
        self.web_scraper = WebScraper()
        self.physics_section = physics_section
        self.biology_section = biology_section
        
    def process_url(self, url):
        """
        Process a URL and update the NSN with extracted information
        """
        # Scrape the URL
        scrape_result = self.web_scraper.scrape_url(url)
        
        if not scrape_result['success']:
            return {
                'success': False,
                'error': scrape_result['error']
            }
        
        # Extract data from scrape result
        data = scrape_result['data']
        
        # Create a new neuron for the webpage
        title = data['title']
        if not title:
            title = url.split('//')[1].split('/')[0]  # Use domain as fallback title
        
        # Determine which section to add the neuron to based on content analysis
        section = self._determine_section(data)
        
        # Check if neuron already exists
        if title in section.neurons:
            # Update existing neuron
            neuron = section.neurons[title]
        else:
            # Create new neuron
            neuron = section.add_neuron(title)
        
        # Update neuron definition box with web content
        neuron.definition_box['url'] = url
        neuron.definition_box['description'] = data['description']
        neuron.definition_box['keywords'] = data['keywords']
        
        # Extract examples from content
        examples = self._extract_examples(data['text_content'], data['headings'])
        if examples:
            neuron.definition_box['examples'] = examples
        
        # Create connections to other neurons based on keywords
        connections_made = self._create_connections(neuron, data['keywords'])
        
        # Update FPP probabilities
        neuron.update_fpp()
        
        return {
            'success': True,
            'neuron': title,
            'section': section.domain,
            'connections': connections_made
        }
    
    def _extract_examples(self, text_content, headings):
        """
        Extract examples from the text content
        """
        examples = []
        
        # Extract content under headings that might contain examples
        example_keywords = ['example', 'case', 'instance', 'illustration']
        
        for heading in headings:
            if any(keyword in heading['text'].lower() for keyword in example_keywords):
                # This heading might introduce examples
                examples.append(heading['text'])
        
        # If no explicit examples found, take first few sentences
        if not examples and text_content:
            sentences = text_content.split('.')
            examples = [s.strip() + '.' for s in sentences[:3] if len(s.strip()) > 20]
        
        return examples[:5]  # Limit to 5 examples
    
    def _determine_section(self, data):
        """
        Determine which section to add the neuron based on content analysis
        """
        physics_keywords = ['physics', 'mechanics', 'energy', 'force', 'motion', 'quantum', 'particle']
        biology_keywords = ['biology', 'cell', 'organism', 'evolution', 'genetics', 'protein', 'dna']
        
        physics_score = 0
        biology_score = 0
        
        # Check keywords and content
        all_text = ' '.join([data['title'], data['description']] + data['keywords'])
        all_text = all_text.lower()
        
        for keyword in physics_keywords:
            if keyword in all_text:
                physics_score += 1
                
        for keyword in biology_keywords:
            if keyword in all_text:
                biology_score += 1
        
        return self.physics_section if physics_score >= biology_score else self.biology_section

    def _create_connections(self, source_neuron, keywords):
        """
        Create connections between the source neuron and existing neurons based on keywords
        """
        connections_made = []
        
        # Check all sections for potential connections
        for section in [self.physics_section, self.biology_section]:
            for concept, target_neuron in section.neurons.items():
                # Skip self-connection
                if target_neuron == source_neuron:
                    continue
                
                # Calculate connection strength based on keyword matches
                match_count = sum(1 for keyword in keywords if keyword.lower() in concept.lower())
                if match_count > 0:
                    # Calculate probability based on number of matching keywords
                    probability = min(0.9, 0.5 + (match_count * 0.1))  # Cap at 0.9
                    
                    source_neuron.add_connection(target_neuron, probability)
                    target_neuron.add_connection(source_neuron, probability)
                    target_neuron.update_fpp()
                    
                    connections_made.append({
                        'target': concept,
                        'section': section.domain,
                        'probability': probability,
                        'matches': match_count
                    })
        
        return connections_made