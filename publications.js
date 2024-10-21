// Store parsed BibTeX data globally
let bibtexData = [];

// Fetch and parse the BibTeX file
async function loadBibtexData() {
  try {
    const response = await fetch('publications.bib'); // Path to your .bib file
    const bibtexText = await response.text();

    // Parse BibTeX using bibtexParse.js
    const parsedBibtex = bibtexParse.toJSON(bibtexText);

    // List of citation keys to prioritize at the top in a specific order
    const prioritizedKeys = ['Zhang20213214', 'Zhang20236141'];

    // Process parsed entries into the required format
    bibtexData = parsedBibtex.map(entry => ({
      key: entry.citationKey,
      title: entry.entryTags.title || 'Unknown Title',
      authors: formatAuthors(entry.entryTags.author) || 'Unknown Author',  // Format authors
      publisher: entry.entryTags.journal || entry.entryTags.booktitle || 'Unknown Publisher',
      year: parseInt(entry.entryTags.year) || 'Unknown Year',  // Ensure year is an integer for sorting
      quartile: entry.entryTags.rank || 'No Rank',  // Add this manually in BibTeX if needed
      pdfLink: `./pdfs/${entry.citationKey}.pdf`,  // Link to local PDF
      codeLink: entry.entryTags.code || null, // Code link if present in BibTeX
      datasetLink: entry.entryTags.dataset || null, // Dataset link if present in BibTeX
      ieeeCitation: generateIeeeCitation(entry),  // Generate IEEE citation format
    }));

    // Split publications into prioritized and non-prioritized
    const prioritizedPublications = bibtexData.filter(pub => prioritizedKeys.includes(pub.key));
    const nonPrioritizedPublications = bibtexData.filter(pub => !prioritizedKeys.includes(pub.key));

    // Sort the prioritized publications based on the order in `prioritizedKeys`
    prioritizedPublications.sort((a, b) => {
      return prioritizedKeys.indexOf(a.key) - prioritizedKeys.indexOf(b.key);
    });

    // Sort the remaining publications by year in descending order
    nonPrioritizedPublications.sort((a, b) => b.year - a.year);

    // Combine the prioritized and non-prioritized publications
    bibtexData = [...prioritizedPublications, ...nonPrioritizedPublications];

    // Load the first set of publications
    loadPublications(bibtexData, 20);
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

// Function to get quartile-specific badge color
function getQuartileBadgeColor(quartile) {
  switch (quartile) {
    case 'Q1':
      return 'bg-danger'; // Red (Bootstrap 5)
    case 'Q2':
      return 'bg-warning'; // Yellow (Bootstrap 5)
    case 'Q3':
      return 'bg-success'; // Green (Bootstrap 5)
    case 'Q4':
      return 'bg-secondary'; // Grey (Bootstrap 5)
    default:
      return 'bg-light'; // Default (Bootstrap 5)
  }
}

// Function to create publication cards dynamically in a single-column layout
function createPublicationCard(publication) {
  const badgeColorClass = getQuartileBadgeColor(publication.quartile);
  
  return `
    <div class="col-12">
      <div class="publication-card p-3 mb-3">
        <div>
          <h5><strong>${publication.title}</strong></h5>
          <p><i>${publication.authors}</i></p>
          <p>${publication.publisher} - ${publication.year} <span class="badge ${badgeColorClass} badge-quartile">${publication.quartile}</span></p>
        </div>
        <div class="mt-2 pub-buttons">
          <button class="btn btn-outline-primary cite-btn" data-key="${publication.key}">
            <i class="fas fa-quote-right"></i> Cite
          </button>
          <a href="${publication.pdfLink}" class="btn btn-outline-success ${publication.pdfLink ? '' : 'disabled'}" target="_blank">
            <i class="fas fa-file-pdf"></i> PDF
          </a>
          <a href="${publication.codeLink}" class="btn btn-outline-secondary ${publication.codeLink ? '' : 'disabled'}" target="_blank">
            <i class="fas fa-code"></i> Code
          </a>
          <a href="${publication.datasetLink}" class="btn btn-outline-info ${publication.datasetLink ? '' : 'disabled'}" target="_blank">
            <i class="fas fa-database"></i> Dataset
          </a>
        </div>
      </div>
    </div>`;
}

// Function to load and display publications
function loadPublications(publications, limit = 20) {
  const publicationsList = document.getElementById('publications-list');
  const publicationsToShow = publications.slice(0, limit);

  publicationsToShow.forEach(pub => {
    publicationsList.innerHTML += createPublicationCard(pub);
  });

  // Handle the "See More" button visibility
  const seeMoreBtn = document.getElementById('see-more');
  if (publications.length > limit) {
    seeMoreBtn.style.display = 'block';
  } else {
    seeMoreBtn.style.display = 'none';
  }
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
  // Style the "See More" button dynamically
  const seeMoreBtn = document.getElementById('see-more');
  if (seeMoreBtn) {
    // Center the button and set the desired width
    seeMoreBtn.style.display = 'block';
    seeMoreBtn.style.margin = '20px auto';  // Center horizontally
    seeMoreBtn.style.width = '200px';       // Set custom width
    seeMoreBtn.style.padding = '10px 20px'; // Add padding for size
    seeMoreBtn.style.fontSize = '18px';     // Increase font size
  }

  // Event listener for "See More" button
  document.getElementById('see-more').addEventListener('click', () => {
    loadPublications(bibtexData, bibtexData.length); // Load all publications
  });
};
