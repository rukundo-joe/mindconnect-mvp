document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout');
  const searchInput = document.getElementById('search-input');
  const resourcesDiv = document.getElementById('resources');
  const noResultsDiv = document.getElementById('no-results');
  // Handle Logout
  logoutBtn.addEventListener('click', async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  });

  // Authenticate user
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
  }

  const resources = [
    {
      id: 1,
      title: 'Understanding Anxiety',
      description: 'Learn about the causes, symptoms, and management techniques for anxiety.',
      type: 'article',
      link: 'https://www.example.com/anxiety-article',
      date: '2024-04-25',
      image: 'https://via.placeholder.com/400x200',
    },
    {
      id: 2,
      title: 'Stress Management Techniques',
      description: 'Explore effective strategies to manage and reduce stress in your daily life.',
      type: 'video',
      link: 'https://www.example.com/stress-management-video',
      date: '2024-05-10',
      image: 'https://via.placeholder.com/400x200',
    },
    // Add more resources as needed
  ];

  function renderResources(filteredResources) {
    resourcesDiv.innerHTML = '';
    if (filteredResources.length === 0) {
      noResultsDiv.classList.remove('hidden');
      return;
    } else {
      noResultsDiv.classList.add('hidden');
    }

    filteredResources.forEach(resource => {
      const resourceCard = document.createElement('div');
      resourceCard.classList.add('bg-white', 'rounded-lg', 'shadow-md', 'overflow-hidden', 'hover:shadow-xl', 'transition-shadow', 'duration-300');
      resourceCard.innerHTML = `
        <img src="${resource.image}" alt="${resource.title}" class="w-full h-48 object-cover">
        <div class="p-4">
          <h3 class="text-xl font-semibold text-gray-800">${resource.title}</h3>
          <p class="text-gray-600 mt-2">${resource.description}</p>
          <div class="mt-4 flex justify-between items-center">
            <a href="${resource.link}" target="_blank" class="text-purple-600 hover:underline flex items-center">
              <i class="${resource.type === 'article' ? 'fas fa-book' : 'fas fa-video'} mr-2"></i> 
              ${resource.type === 'article' ? 'Read Article' : 'Watch Video'}
            </a>
            <span class="text-sm text-gray-500">${resource.date}</span>
          </div>
        </div>
      `;
      resourcesDiv.appendChild(resourceCard);
    });
  }

  renderResources(resources);

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = resources.filter(resource =>
      resource.title.toLowerCase().includes(query) ||
      resource.description.toLowerCase().includes(query)
    );
    renderResources(filtered);
  });

  // Fetch user info
  fetch('/api/user', {
    headers: { 'Authorization': `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      if (!data.user) {
        window.location.href = 'index.html';
      }
    })
    .catch(() => {
      window.location.href = 'index.html';
    });

  // Static content; can be dynamic in future
});
