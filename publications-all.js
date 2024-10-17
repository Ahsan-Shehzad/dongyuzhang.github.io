// Store parsed BibTeX data globally
let bibtexData = [];

// Fetch and parse the BibTeX file
async function loadBibtexData() {
  try {
    const response = await fetch('publications.bib'); // Path to your .bib file
    const bibtexText = await response.text();

    // Parse BibTeX using bibtexParse.js
    const parsedBibtex = bibtexParse.toJSON(bibtexText);

    // Process parsed entries into the required format and sort by year in descending order
    bibtexData = parsedBibtex.map(entry => ({
      key: entry.citationKey,
      title: entry.entryTags.title || 'Unknown Title',
      authors: formatAuthors(entry.entryTags.author) || 'Unknown Author',  // Format authors
      publisher: entry.entryTags.journal || entry.entryTags.booktitle || 'Unknown Publisher',
      year: parseInt(entry.entryTags.year) || 'Unknown Year',  // Ensure year is an integer for sorting
      quartile: entry.entryTags.quartile || 'No Rank',  // Add this manually in BibTeX if needed
      pdfLink: entry.entryTags.url || '#',  // PDF link, ensure your .bib file has a `url` field
      codeLink: entry.entryTags.code || '#', // Code link if present in BibTeX
      ieeeCitation: generateIeeeCitation(entry),  // Generate IEEE citation format
    }));

    // Sort publications by year in descending order
    bibtexData.sort((a, b) => b.year - a.year);

    // Load the first set of publications
    loadPublications(bibtexData);
  } catch (error) {
    console.error('Error loading or parsing BibTeX:', error);
  }
}

// Function to format authors for IEEE style
function formatAuthors(authorsString) {
  if (!authorsString) return '';

  const authors = authorsString.split(' and ');
  if (authors.length > 3) {
    return `${authors[0]}, ${authors[1]}, et al.`;
  } else {
    return authors.join(', ');
  }
}

// Function to generate IEEE citation format
function generateIeeeCitation(entry) {
  const authors = formatAuthors(entry.entryTags.author);
  const title = entry.entryTags.title;
  const journalOrPublisher = entry.entryTags.journal || entry.entryTags.booktitle;
  const year = entry.entryTags.year;

  return `${authors}, "${title}," ${journalOrPublisher}, ${year}.`;
}

// Function to create publication cards dynamically in a single-column layout
function createPublicationCard(publication) {
  return `
    <div class="col-12">
      <div class="publication-card p-3 mb-3">
        <div>
          <h5><strong>${publication.title}</strong></h5>
          <p><i>${publication.authors}</i></p>
          <p>${publication.publisher} - ${publication.year} <span class="badge bg-info badge-quartile">${publication.quartile}</span></p>
        </div>
        <div class="mt-2 pub-buttons">
          <button class="btn btn-outline-primary cite-btn" data-key="${publication.key}">
            <i class="fas fa-quote-right"></i> Cite
          </button>
          <a href="${publication.pdfLink}" class="btn btn-outline-success" target="_blank">
            <i class="fas fa-file-pdf"></i> PDF
          </a>
          <a href="${publication.codeLink}" class="btn btn-outline-secondary" target="_blank">
            <i class="fas fa-code"></i> Code
          </a>
        </div>
      </div>
    </div>`;
}

// Function to load and display publications
function loadPublications(publications) {
  const publicationsList = document.getElementById('publications-list');
  publications.forEach(pub => {
    publicationsList.innerHTML += createPublicationCard(pub);
  });
}

// Function to show the citation modal with IEEE format
function showCitationDialog(citation) {
  const citationDialog = document.createElement('div');
  citationDialog.classList.add('modal', 'fade');
  citationDialog.id = 'citationModal';
  citationDialog.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Citation</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <textarea class="form-control" rows="5">${citation}</textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button class="btn btn-primary" id="copy-citation">Copy</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(citationDialog);
  const modal = new bootstrap.Modal(citationDialog);
  modal.show();

  // Copy citation to clipboard
  document.getElementById('copy-citation').addEventListener('click', () => {
    navigator.clipboard.writeText(citation);
  });
}

// Handle click events for cite buttons
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('cite-btn') || event.target.closest('.cite-btn')) {
    const publicationKey = event.target.closest('.cite-btn').getAttribute('data-key'); // Get the key
    const publication = bibtexData.find(pub => pub.key === publicationKey); // Find the publication
    if (publication) {
      showCitationDialog(publication.ieeeCitation); // Show the citation in IEEE format in a modal dialog
    }
  }
});

// Load initial publications on page load
window.onload = () => {
  loadBibtexData(); // Load the BibTeX data
};
