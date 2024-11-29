// public/js/admin.js

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const profileButton = document.getElementById('profile-button');
  const profileDropdown = document.getElementById('profile-dropdown');
  const logoutButton = document.getElementById('logout-button');
  const toastContainer = document.getElementById('toast-container');
  const loadingIndicator = document.getElementById('loading-indicator');

  // Overview Cards Elements
  const totalUsers = document.getElementById('total-users');
  const activeUsers = document.getElementById('active-users');
  const newRegistrations = document.getElementById('new-registrations');
  const totalPosts = document.getElementById('total-posts');

  // Users Table Elements
  const usersTableBody = document.querySelector('#users-table tbody');
  const userSearchInput = document.getElementById('user-search');
  const usersPrevPage = document.getElementById('users-prev-page');
  const usersNextPage = document.getElementById('users-next-page');
  const usersPaginationInfo = document.getElementById('users-pagination-info');

  // Content Table Elements
  const contentTableBody = document.querySelector('#content-table tbody');
  const contentSearchInput = document.getElementById('content-search');
  const contentPrevPage = document.getElementById('content-prev-page');
  const contentNextPage = document.getElementById('content-next-page');
  const contentPaginationInfo = document.getElementById('content-pagination-info');

  // Modals Elements
  const userModal = document.getElementById('user-modal');
  const closeUserModal = document.getElementById('close-user-modal');
  const userForm = document.getElementById('user-form');
  const addUserButton = document.getElementById('add-user-button');
  const userModalTitle = document.getElementById('user-modal-title');

  const contentModal = document.getElementById('content-modal');
  const closeContentModal = document.getElementById('close-content-modal');
  const contentForm = document.getElementById('content-form');
  const addContentButton = document.getElementById('add-content-button');
  const contentModalTitle = document.getElementById('content-modal-title');

  // Pagination State
  let usersCurrentPage = 1;
  let usersTotalPages = 1;

  let contentCurrentPage = 1;
  let contentTotalPages = 1;

  // Dummy Data
  const dummyUsers = generateDummyUsers(50); // Generates 50 dummy users
  const dummyContent = generateDummyContent(30); // Generates 30 dummy content items

  // Initialize Dashboard Data
  fetchOverviewData();

  // Initialize Tables
  fetchUsers(usersCurrentPage);
  fetchContent(contentCurrentPage);

  // Initialize Charts
  initializeCharts();

  // Event Listeners
  sidebarToggle.addEventListener('click', toggleSidebar);
  profileButton.addEventListener('click', toggleProfileDropdown);
  document.addEventListener('click', closeProfileDropdown);
  logoutButton.addEventListener('click', handleLogout);

  addUserButton.addEventListener('click', () => openUserModal('add'));
  closeUserModal.addEventListener('click', () => closeModal(userModal));
  userForm.addEventListener('submit', handleUserFormSubmit);

  addContentButton.addEventListener('click', () => openContentModal('add'));
  closeContentModal.addEventListener('click', () => closeModal(contentModal));
  contentForm.addEventListener('submit', handleContentFormSubmit);

  userSearchInput.addEventListener('input', debounce(() => {
    usersCurrentPage = 1;
    fetchUsers(usersCurrentPage);
  }, 300));

  contentSearchInput.addEventListener('input', debounce(() => {
    contentCurrentPage = 1;
    fetchContent(contentCurrentPage);
  }, 300));

  usersPrevPage.addEventListener('click', () => {
    if (usersCurrentPage > 1) {
      usersCurrentPage--;
      fetchUsers(usersCurrentPage);
    }
  });

  usersNextPage.addEventListener('click', () => {
    if (usersCurrentPage < usersTotalPages) {
      usersCurrentPage++;
      fetchUsers(usersCurrentPage);
    }
  });

  contentPrevPage.addEventListener('click', () => {
    if (contentCurrentPage > 1) {
      contentCurrentPage--;
      fetchContent(contentCurrentPage);
    }
  });

  contentNextPage.addEventListener('click', () => {
    if (contentCurrentPage < contentTotalPages) {
      contentCurrentPage++;
      fetchContent(contentCurrentPage);
    }
  });

  // Functions

  function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
    sidebar.classList.toggle('expanded');
    // Update toggle icon
    const icon = sidebarToggle.querySelector('i');
    if (sidebar.classList.contains('collapsed')) {
      icon.classList.remove('fa-chevron-left');
      icon.classList.add('fa-chevron-right');
    } else {
      icon.classList.remove('fa-chevron-right');
      icon.classList.add('fa-chevron-left');
    }
  }

  function toggleProfileDropdown(event) {
    event.stopPropagation();
    profileDropdown.classList.toggle('hidden');
  }

  function closeProfileDropdown(event) {
    if (!profileButton.contains(event.target) && !profileDropdown.contains(event.target)) {
      profileDropdown.classList.add('hidden');
    }
  }

  async function handleLogout() {
    try {
      showLoading();
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      hideLoading();
      showToast('Logged out successfully.', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } catch (error) {
      hideLoading();
      console.error('Logout Error:', error);
      showToast('An error occurred during logout.', 'error');
    }
  }

  function openUserModal(mode, user = null) {
    userForm.reset();
    if (mode === 'add') {
      userModalTitle.textContent = 'Add User';
      userForm.dataset.userId = '';
    } else if (mode === 'edit') {
      userModalTitle.textContent = 'Edit User';
      populateUserForm(user);
    }
    userModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }

  function openContentModal(mode, content = null) {
    contentForm.reset();
    if (mode === 'add') {
      contentModalTitle.textContent = 'Add Content';
      contentForm.dataset.contentId = '';
    } else if (mode === 'edit') {
      contentModalTitle.textContent = 'Edit Content';
      populateContentForm(content);
    }
    contentModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function populateUserForm(user) {
    document.getElementById('user-name').value = user.name;
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-role').value = user.role;
    document.getElementById('user-status').value = user.status;
    userForm.dataset.userId = user.id; // Store user ID for editing
  }

  function populateContentForm(content) {
    document.getElementById('content-title').value = content.title;
    document.getElementById('content-author').value = content.author;
    document.getElementById('content-category').value = content.category;
    document.getElementById('content-status').value = content.status;
    contentForm.dataset.contentId = content.id; // Store content ID for editing
  }

  function handleUserFormSubmit(event) {
    event.preventDefault();
    const userId = userForm.dataset.userId;
    const name = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const role = document.getElementById('user-role').value;
    const status = document.getElementById('user-status').value;

    if (!name || !email || !role || !status) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    if (userId) {
      // Edit User
      const userIndex = dummyUsers.findIndex(user => user.id === userId);
      if (userIndex !== -1) {
        dummyUsers[userIndex] = { id: userId, name, email, role, status };
        showToast('User updated successfully.', 'success');
        closeModal(userModal);
        fetchUsers(usersCurrentPage);
      } else {
        showToast('User not found.', 'error');
      }
    } else {
      // Add User
      const newUser = {
        id: generateUUID(),
        name,
        email,
        role,
        status
      };
      dummyUsers.unshift(newUser); // Add to the beginning
      showToast('User added successfully.', 'success');
      closeModal(userModal);
      fetchUsers(usersCurrentPage);
    }
  }

  function handleContentFormSubmit(event) {
    event.preventDefault();
    const contentId = contentForm.dataset.contentId;
    const title = document.getElementById('content-title').value.trim();
    const author = document.getElementById('content-author').value.trim();
    const category = document.getElementById('content-category').value;
    const status = document.getElementById('content-status').value;

    if (!title || !author || !category || !status) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    if (contentId) {
      // Edit Content
      const contentIndex = dummyContent.findIndex(content => content.id === contentId);
      if (contentIndex !== -1) {
        dummyContent[contentIndex] = { id: contentId, title, author, category, status };
        showToast('Content updated successfully.', 'success');
        closeModal(contentModal);
        fetchContent(contentCurrentPage);
      } else {
        showToast('Content not found.', 'error');
      }
    } else {
      // Add Content
      const newContent = {
        id: generateUUID(),
        title,
        author,
        category,
        status
      };
      dummyContent.unshift(newContent); // Add to the beginning
      showToast('Content added successfully.', 'success');
      closeModal(contentModal);
      fetchContent(contentCurrentPage);
    }
  }

  // Fetch Overview Data
  function fetchOverviewData() {
    // Simulate fetching data with dummy values
    const data = {
      totalUsers: dummyUsers.length,
      activeUsers: dummyUsers.filter(user => user.status === 'Active').length,
      newRegistrations: getRandomInt(0, 20),
      totalPosts: dummyContent.length
    };
    animateCount(totalUsers, data.totalUsers);
    animateCount(activeUsers, data.activeUsers);
    animateCount(newRegistrations, data.newRegistrations);
    animateCount(totalPosts, data.totalPosts);
  }

  // Fetch Users Data
  function fetchUsers(page = 1, search = '') {
    showLoading();
    setTimeout(() => { // Simulate API call delay
      let filteredUsers = dummyUsers.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase())
      );

      const usersPerPage = 10;
      usersTotalPages = Math.ceil(filteredUsers.length / usersPerPage);
      const start = (page - 1) * usersPerPage;
      const end = start + usersPerPage;
      const paginatedUsers = filteredUsers.slice(start, end);

      populateUsersTable(paginatedUsers);
      updatePaginationInfo(usersPaginationInfo, page, usersTotalPages);
      usersPrevPage.disabled = page === 1;
      usersNextPage.disabled = page === usersTotalPages;

      hideLoading();
    }, 500);
  }

  // Populate Users Table
  function populateUsersTable(users) {
    usersTableBody.innerHTML = '';
    if (users.length === 0) {
      usersTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No users found.</td></tr>';
      return;
    }

    users.forEach(user => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td class="py-2">${sanitizeHTML(user.name)}</td>
        <td class="py-2">${sanitizeHTML(user.email)}</td>
        <td class="py-2">${sanitizeHTML(user.role)}</td>
        <td class="py-2">
          <span class="px-2 py-1 text-xs ${user.status === 'Active' ? 'text-green-800 bg-green-200' : 'text-red-800 bg-red-200'} rounded-full">${user.status}</span>
        </td>
        <td class="py-2 flex space-x-2">
          <button class="edit-user-button text-blue-500 hover:text-blue-700" data-user='${JSON.stringify(user)}' aria-label="Edit User">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-user-button text-red-500 hover:text-red-700" data-user-id="${user.id}" aria-label="Delete User">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      usersTableBody.appendChild(tr);
    });

    // Attach Event Listeners to Edit and Delete Buttons
    document.querySelectorAll('.edit-user-button').forEach(button => {
      button.addEventListener('click', () => {
        const user = JSON.parse(button.getAttribute('data-user'));
        openUserModal('edit', user);
      });
    });

    document.querySelectorAll('.delete-user-button').forEach(button => {
      button.addEventListener('click', () => {
        const userId = button.getAttribute('data-user-id');
        confirmDeletion('user', userId);
      });
    });
  }

  // Fetch Content Data
  function fetchContent(page = 1, search = '') {
    showLoading();
    setTimeout(() => { // Simulate API call delay
      let filteredContent = dummyContent.filter(content =>
        content.title.toLowerCase().includes(search.toLowerCase()) ||
        content.author.toLowerCase().includes(search.toLowerCase()) ||
        content.category.toLowerCase().includes(search.toLowerCase()) ||
        content.status.toLowerCase().includes(search.toLowerCase())
      );

      const contentPerPage = 10;
      contentTotalPages = Math.ceil(filteredContent.length / contentPerPage);
      const start = (page - 1) * contentPerPage;
      const end = start + contentPerPage;
      const paginatedContent = filteredContent.slice(start, end);

      populateContentTable(paginatedContent);
      updatePaginationInfo(contentPaginationInfo, page, contentTotalPages);
      contentPrevPage.disabled = page === 1;
      contentNextPage.disabled = page === contentTotalPages;

      hideLoading();
    }, 500);
  }

  // Populate Content Table
  function populateContentTable(content) {
    contentTableBody.innerHTML = '';
    if (content.length === 0) {
      contentTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No content found.</td></tr>';
      return;
    }

    content.forEach(item => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td class="py-2">${sanitizeHTML(item.title)}</td>
        <td class="py-2">${sanitizeHTML(item.author)}</td>
        <td class="py-2">${sanitizeHTML(item.category)}</td>
        <td class="py-2">
          <span class="px-2 py-1 text-xs ${item.status === 'Published' ? 'text-green-800 bg-green-200' : (item.status === 'Draft' ? 'text-yellow-800 bg-yellow-200' : 'text-red-800 bg-red-200')} rounded-full">${item.status}</span>
        </td>
        <td class="py-2 flex space-x-2">
          <button class="edit-content-button text-blue-500 hover:text-blue-700" data-content='${JSON.stringify(item)}' aria-label="Edit Content">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-content-button text-red-500 hover:text-red-700" data-content-id="${item.id}" aria-label="Delete Content">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      contentTableBody.appendChild(tr);
    });

    // Attach Event Listeners to Edit and Delete Buttons
    document.querySelectorAll('.edit-content-button').forEach(button => {
      button.addEventListener('click', () => {
        const content = JSON.parse(button.getAttribute('data-content'));
        openContentModal('edit', content);
      });
    });

    document.querySelectorAll('.delete-content-button').forEach(button => {
      button.addEventListener('click', () => {
        const contentId = button.getAttribute('data-content-id');
        confirmDeletion('content', contentId);
      });
    });
  }

  // Confirm Deletion
  function confirmDeletion(type, id) {
    if (confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
      if (type === 'user') {
        deleteUser(id);
      } else if (type === 'content') {
        deleteContent(id);
      }
    }
  }

  // Delete User
  function deleteUser(userId) {
    showLoading();
    setTimeout(() => { // Simulate API call delay
      const userIndex = dummyUsers.findIndex(user => user.id === userId);
      if (userIndex !== -1) {
        dummyUsers.splice(userIndex, 1);
        showToast('User deleted successfully.', 'success');
        fetchUsers(usersCurrentPage);
      } else {
        showToast('User not found.', 'error');
      }
      hideLoading();
    }, 500);
  }

  // Delete Content
  function deleteContent(contentId) {
    showLoading();
    setTimeout(() => { // Simulate API call delay
      const contentIndex = dummyContent.findIndex(content => content.id === contentId);
      if (contentIndex !== -1) {
        dummyContent.splice(contentIndex, 1);
        showToast('Content deleted successfully.', 'success');
        fetchContent(contentCurrentPage);
      } else {
        showToast('Content not found.', 'error');
      }
      hideLoading();
    }, 500);
  }

  // Initialize Charts
  function initializeCharts() {
    // User Growth Chart
    const ctxUserGrowth = document.getElementById('user-growth-chart').getContext('2d');
    window.userGrowthChart = new Chart(ctxUserGrowth, {
      type: 'line',
      data: {
        labels: getLast12Months(),
        datasets: [{
          label: 'User Growth',
          data: generateRandomData(12, 100, 1000), // Dummy data
          backgroundColor: 'rgba(59, 130, 246, 0.2)', // Blue-500
          borderColor: 'rgba(59, 130, 246, 1)', // Blue-500
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    });

    // Content Engagement Chart
    const ctxContentEngagement = document.getElementById('content-engagement-chart').getContext('2d');
    window.contentEngagementChart = new Chart(ctxContentEngagement, {
      type: 'bar',
      data: {
        labels: ['Chat', 'Journal', 'Library', 'Blog'], // Dummy categories
        datasets: [{
          label: 'Engagement',
          data: generateRandomData(4, 100, 500), // Dummy data
          backgroundColor: [
            'rgba(59, 130, 246, 0.6)', // Blue-500
            'rgba(16, 185, 129, 0.6)', // Green-500
            'rgba(239, 68, 68, 0.6)',  // Red-500
            'rgba(236, 72, 153, 0.6)'  // Pink-500
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(236, 72, 153, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    });

    // Simulate Real-Time Data Updates
    setInterval(() => {
      updateCharts();
    }, 5000); // Update every 5 seconds
  }

  // Update Charts with New Data
  function updateCharts() {
    // Update User Growth Chart
    const newUserCount = getRandomInt(50, 150);
    userGrowthChart.data.datasets[0].data.push(newUserCount);
    userGrowthChart.data.datasets[0].data.shift();
    userGrowthChart.update();

    // Update Content Engagement Chart
    const newEngagementData = generateRandomData(4, 100, 500);
    contentEngagementChart.data.datasets[0].data = newEngagementData;
    contentEngagementChart.update();
  }

  // Utility Functions

  function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(null, args);
      }, delay);
    };
  }

  function showLoading() {
    loadingIndicator.classList.remove('hidden');
  }

  function hideLoading() {
    loadingIndicator.classList.add('hidden');
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} icon"></i>
      <div class="message">${sanitizeHTML(message)}</div>
    `;
    toastContainer.appendChild(toast);
    // Trigger animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  function animateCount(element, target) {
    let count = 0;
    const increment = target / 100; // Adjust for smoothness
    const updateCount = () => {
      count += increment;
      if (count < target) {
        element.textContent = Math.ceil(count);
        requestAnimationFrame(updateCount);
      } else {
        element.textContent = target;
      }
    };
    updateCount();
  }

  function updatePaginationInfo(element, currentPage, totalPages) {
    element.textContent = `Page ${currentPage} of ${totalPages}`;
  }

  function getLast12Months() {
    const months = [];
    const date = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const month = d.toLocaleString('default', { month: 'short' });
      months.push(month);
    }
    return months;
  }

  function generateRandomData(count, min, max) {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push(getRandomInt(min, max));
    }
    return data;
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateUUID() { // Simple UUID generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Dummy Data Generators

  function generateDummyUsers(count) {
    const roles = ['Admin', 'Editor', 'Viewer'];
    const statuses = ['Active', 'Inactive'];
    const users = [];
    for (let i = 1; i <= count; i++) {
      users.push({
        id: generateUUID(),
        name: `User ${i}`,
        email: `user${i}@mindconnect.com`,
        role: roles[getRandomInt(0, roles.length - 1)],
        status: statuses[getRandomInt(0, statuses.length - 1)]
      });
    }
    return users;
  }

  function generateDummyContent(count) {
    const categories = ['Blog', 'Article', 'News'];
    const statuses = ['Published', 'Draft', 'Pending'];
    const content = [];
    for (let i = 1; i <= count; i++) {
      content.push({
        id: generateUUID(),
        title: `Content Title ${i}`,
        author: `Author ${i}`,
        category: categories[getRandomInt(0, categories.length - 1)],
        status: statuses[getRandomInt(0, statuses.length - 1)]
      });
    }
    return content;
  }

});
