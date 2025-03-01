document.addEventListener('DOMContentLoaded', async function () {
    try {
        showLoading(true);
        await loadJSONData();
        extractCompanies();
        renderCompanyList();
        addEventListeners();
        initChart(); // Ensure the chart is initialized before updating
        initComparisonChart();
        setupDarkMode(); // Initialize dark mode
        setupFilters();
        setupChartControls();
        setupTimeRangeFilters();
        setupDownloadFeatures();
        showLoading(false);
    } catch (error) {
        console.error('Error initializing application:', error);
        alert('Failed to load data. Please try again later.');
        showLoading(false);
    }
});

// Global variables
let stockData = [];
let companies = [];
let chart = null; // Ensure chart is globally accessible
let comparisonChart = null;
let compareMode = false;
let comparedCompanies = [];
let favorites = [];
let currentTimeRange = 'all'; // 'all', '1y', '3y'
let currentChartType = 'line';
let selectedCompany = null;

// Show/hide loading spinner
function showLoading(show) {
    // Remove any existing spinners
    document.querySelectorAll('.spinner-overlay').forEach(el => el.remove());
    
    if (show) {
        const stockChartContainer = document.getElementById('stockChart').parentElement;
        const spinner = document.createElement('div');
        spinner.className = 'spinner-overlay';
        spinner.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;
        stockChartContainer.appendChild(spinner);
    }
}

// Load JSON data
async function loadJSONData() {
    try {
        // Simulate data loading (in real app, fetch from server)
        // Placeholder data - to be replaced with actual fetch
        // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading delay
        
        // This is a placeholder for the actual fetch - would need to fetch real data
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        stockData = await response.json();
        
        // For demonstration purposes, let's ensure we have some reasonable random data
        // In a real application, this would be replaced with actual API data
        if (!stockData || stockData.length === 0) {
            stockData = generateDemoData();
        }

        // Convert data format
        stockData = stockData.map(row => {
            const dateParts = row.index_date ? row.index_date.split('-').map(Number) : null;
            return {
                date: dateParts ? new Date(dateParts[2], dateParts[1] - 1, dateParts[0]) : row.date || new Date(),
                company: row.index_name || row.company,
                price: parseFloat(row.closing_index_value || row.price),
                open: parseFloat(row.opening_index_value || row.open || (row.price * 0.99)),
                high: parseFloat(row.high_index_value || row.high || (row.price * 1.02)),
                low: parseFloat(row.low_index_value || row.low || (row.price * 0.98)),
                volume: parseInt(row.volume || Math.random() * 1000000)
            };
        });

        // Load favorites from localStorage
        loadFavorites();

    } catch (error) {
        console.error('Error loading JSON data:', error);
        // Fallback to demo data
        stockData = generateDemoData();
        throw error;
    }
}

// Generate demo data if real data is unavailable
function generateDemoData() {
    const demoCompanies = ['S&P 500', 'NASDAQ', 'Dow Jones', 'FTSE 100', 'Nikkei 225', 'DAX'];
    const demoData = [];
    
    // Generate 5 years of data for each index
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear() - 5, endDate.getMonth(), endDate.getDate());
    
    for (let company of demoCompanies) {
        let price = 1000 + Math.random() * 2000; // Starting price
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            // Skip weekends
            if (d.getDay() === 0 || d.getDay() === 6) continue;
            
            // Random daily change (-2% to +2%)
            const change = (Math.random() * 4 - 2) / 100;
            price = price * (1 + change);
            
            // Add some trend
            if (company === 'S&P 500' || company === 'NASDAQ') {
                price *= 1.0002; // Slight upward trend
            }
            
            const dailyVolatility = 0.01;
            const open = price * (1 + (Math.random() * dailyVolatility * 2 - dailyVolatility));
            const high = Math.max(price, open) * (1 + Math.random() * dailyVolatility);
            const low = Math.min(price, open) * (1 - Math.random() * dailyVolatility);
            
            demoData.push({
                company: company,
                date: new Date(d),
                price: price,
                open: open,
                high: high,
                low: low,
                volume: Math.floor(Math.random() * 10000000)
            });
        }
    }
    
    return demoData;
}

// Extract unique indices (companies)
function extractCompanies() {
    const companySet = new Set(stockData.map(row => row.company));
    companies = Array.from(companySet).sort();
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Load favorites from localStorage
function loadFavorites() {
    const saved = localStorage.getItem('favorites');
    if (saved) {
        favorites = JSON.parse(saved);
    }
}

// Toggle favorite status
function toggleFavorite(company) {
    const index = favorites.indexOf(company);
    if (index === -1) {
        favorites.push(company);
    } else {
        favorites.splice(index, 1);
    }
    saveFavorites();
    renderCompanyList(); // Re-render to show updated stars
}

// Render the company list
function renderCompanyList() {
    const companyListElement = document.getElementById('companyList');
    companyListElement.innerHTML = '';
    
    // Check if we're filtering favorites only
    const showFavoritesOnly = document.getElementById('favoriteFilter')?.checked || false;
    
    // Get search term
    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
    
    let filteredCompanies = companies;
    
    // Filter by search term
    if (searchTerm) {
        filteredCompanies = filteredCompanies.filter(company => 
            company.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter by favorites
    if (showFavoritesOnly) {
        filteredCompanies = filteredCompanies.filter(company => 
            favorites.includes(company)
        );
    }

    filteredCompanies.forEach(company => {
        const listItem = document.createElement('a');
        listItem.href = '#';
        listItem.className = 'list-group-item list-group-item-action';
        if (selectedCompany === company) {
            listItem.classList.add('active');
        }
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = company;
        listItem.appendChild(nameSpan);
        
        const starIcon = document.createElement('i');
        starIcon.className = `fas fa-star favorite-icon ${favorites.includes(company) ? '' : 'inactive'}`;
        starIcon.dataset.company = company;
        listItem.appendChild(starIcon);
        
        listItem.dataset.company = company;
        companyListElement.appendChild(listItem);
        
        // Add animation
        listItem.classList.add('fade-in');
    });
    
    // Show a message if no companies match the filters
    if (filteredCompanies.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'p-3 text-center text-muted';
        noResults.textContent = 'No indices match your criteria';
        companyListElement.appendChild(noResults);
    }
}

// Add event listeners for selecting a company and other interactions
function addEventListeners() {
    // Company selection
    document.getElementById('companyList').addEventListener('click', function (event) {
        // Handle star icon click
        if (event.target.classList.contains('favorite-icon')) {
            event.preventDefault();
            event.stopPropagation();
            toggleFavorite(event.target.dataset.company);
            return;
        }
        
        // Handle company selection
        if (event.target.classList.contains('list-group-item') || event.target.parentElement.classList.contains('list-group-item')) {
            const item = event.target.classList.contains('list-group-item') ? event.target : event.target.parentElement;
            document.querySelectorAll('.list-group-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const company = item.dataset.company;
            selectedCompany = company;
            
            if (compareMode) {
                addToComparison(company);
            } else {
                updateChart(company);
                updateStatistics(company);
                document.getElementById('selectedCompany').textContent = company;
            }
        }
    });
    
    // Favorite filter toggle
    document.getElementById('favoriteFilter').addEventListener('change', function() {
        renderCompanyList();
    });
    
    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', function() {
        renderCompanyList();
    });
    
    document.getElementById('searchInput').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            renderCompanyList();
        }
    });
    
    // Compare mode toggle
    document.getElementById('compareBtn').addEventListener('click', function() {
        toggleCompareMode();
    });
    
    // Clear comparison
    document.getElementById('clearCompare').addEventListener('click', function() {
        clearComparison();
    });
    
    // About modal
    document.getElementById('aboutBtn').addEventListener('click', function() {
        const aboutModal = new bootstrap.Modal(document.getElementById('aboutModal'));
        aboutModal.show();
    });
}

// Setup time range filters (1Y, 3Y, All)
function setupTimeRangeFilters() {
    document.getElementById('view1Y').addEventListener('click', function() {
        setTimeRange('1y');
    });
    
    document.getElementById('view3Y').addEventListener('click', function() {
        setTimeRange('3y');
    });
    
    document.getElementById('viewAll').addEventListener('click', function() {
        setTimeRange('all');
    });
}

// Set time range and update chart
function setTimeRange(range) {
    currentTimeRange = range;
    
    // Update active button
    document.querySelectorAll('#view1Y, #view3Y, #viewAll').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (range === '1y') {
        document.getElementById('view1Y').classList.add('active');
    } else if (range === '3y') {
        document.getElementById('view3Y').classList.add('active');
    } else {
        document.getElementById('viewAll').classList.add('active');
    }
    
    // Refresh the current chart
    if (compareMode) {
        updateComparisonChart();
    } else if (selectedCompany) {
        updateChart(selectedCompany);
    }
}

// Setup chart type controls
function setupChartControls() {
    document.querySelectorAll('.chart-type').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const type = this.dataset.type;
            setChartType(type);
        });
    });
}

// Set chart type and update chart
function setChartType(type) {
    currentChartType = type;
    
    // Refresh the current chart
    if (selectedCompany) {
        updateChart(selectedCompany);
    }
}

// Setup download features
function setupDownloadFeatures() {
    // CSV Download
    document.getElementById('downloadCSV').addEventListener('click', function() {
        if (!selectedCompany) return;
        
        const companyData = getFilteredCompanyData(selectedCompany);
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Open,High,Low,Close,Volume\n";
        
        companyData.forEach(row => {
            const date = row.x.toISOString().split('T')[0];
            csvContent += `${date},${row.open},${row.high},${row.low},${row.y},${row.volume}\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${selectedCompany.replace(/\s/g, '_')}_stock_data.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    // Chart image download
    document.getElementById('downloadChart').addEventListener('click', function() {
        if (!chart) return;
        
        const canvas = document.getElementById('stockChart');
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.setAttribute("href", image);
        link.setAttribute("download", `${selectedCompany || 'chart'}_${new Date().toISOString().split('T')[0]}.png`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// Setup search and filter functionality
function setupFilters() {
    // Already handled in addEventListeners()
}

// Toggle comparison mode
function toggleCompareMode() {
    compareMode = !compareMode;
    const compareBtn = document.getElementById('compareBtn');
    
    if (compareMode) {
        compareBtn.classList.remove('btn-success');
        compareBtn.classList.add('btn-danger');
        compareBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
        
        // Show comparison card
        document.getElementById('comparisonCard').style.display = 'block';
        document.getElementById('comparisonCard').classList.add('slide-in');
        
        // If we have a selected company, add it to comparison
        if (selectedCompany) {
            addToComparison(selectedCompany);
        }
    } else {
        compareBtn.classList.remove('btn-danger');
        compareBtn.classList.add('btn-success');
        compareBtn.innerHTML = '<i class="fas fa-plus"></i> Compare';
        
        // Hide comparison card
        document.getElementById('comparisonCard').style.display = 'none';
        
        // Clear comparison data
        clearComparison();
    }
}

// Add a company to comparison
function addToComparison(company) {
    if (!comparedCompanies.includes(company)) {
        comparedCompanies.push(company);
        updateComparisonChart();
    }
}

// Clear comparison
function clearComparison() {
    comparedCompanies = [];
    if (comparisonChart) {
        comparisonChart.data.datasets = [];
        comparisonChart.update();
    }
}

// Initialize Chart.js chart
function initChart() {
    const ctx = document.getElementById('stockChart').getContext('2d');
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Stock Price',
                data: [],
                borderColor: '#00c2ff',
                backgroundColor: 'rgba(0, 194, 255, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            if (point && typeof point === 'object' && 'open' in point) {
                                return [
                                    `Open: ${point.open?.toFixed(2)}`,
                                    `High: ${point.high?.toFixed(2)}`,
                                    `Low: ${point.low?.toFixed(2)}`,
                                    `Close: ${point.y?.toFixed(2)}`,
                                    `Volume: ${point.volume?.toLocaleString()}`
                                ];
                            }
                            return `Price: ${context.parsed.y?.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        displayFormats: {
                            month: 'MMM yyyy'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price'
                    },
                    beginAtZero: false
                }
            }
        }
    });
}

// Initialize comparison chart
function initComparisonChart() {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    comparisonChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        displayFormats: {
                            month: 'MMM yyyy'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Normalized Price (%)'
                    },
                    beginAtZero: false
                }
            }
        }
    });
}

// Filter data based on time range
function filterDataByTimeRange(data) {
    if (currentTimeRange === 'all') {
        return data;
    }
    
    const now = new Date();
    let cutoffDate;
    
    if (currentTimeRange === '1y') {
        cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    } else if (currentTimeRange === '3y') {
        cutoffDate = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
    }
    
    return data.filter(item => item.x >= cutoffDate);
}

// Get filtered company data with proper formatting
function getFilteredCompanyData(company) {
    const companyData = stockData
        .filter(row => row.company === company)
        .sort((a, b) => a.date - b.date)
        .map(row => ({
            x: row.date,
            y: row.price,
            open: row.open,
            high: row.high,
            low: row.low,
            volume: row.volume
        }));
    
    // Apply time range filter
    if (currentTimeRange === '1y') {
        const now = new Date();
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        return companyData.filter(item => item.x >= oneYearAgo);
    } else if (currentTimeRange === '3y') {
        const now = new Date();
        const threeYearsAgo = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
        return companyData.filter(item => item.x >= threeYearsAgo);
    }
    
    return companyData;
}

// Update chart with selected company's data
function updateChart(company) {
    console.log('Updating chart for:', company);
    showLoading(true);

    if (!stockData.length) {
        console.warn('Stock data not loaded yet.');
        showLoading(false);
        return;
    }

    const formattedData = getFilteredCompanyData(company);

    console.log("Formatted & Sorted Data:", formattedData);

    if (formattedData.length === 0) {
        console.warn('No data available for', company);
        showLoading(false);
        return;
    }

    // Update chart type
    chart.config.type = currentChartType === 'candlestick' ? 'bar' : currentChartType;

    // Clear existing datasets
    chart.data.datasets = [];

    // Create dataset based on chart type
    if (currentChartType === 'bar') {
        chart.data.datasets.push({
            label: company,
            data: formattedData,
            backgroundColor: 'rgba(0, 123, 255, 0.7)',
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1
        });
    } else if (currentChartType === 'candlestick') {
        // Display as a custom bar chart to simulate candlesticks
        chart.data.datasets.push({
            label: company,
            data: formattedData,
            backgroundColor: formattedData.map(d => d.y >= d.open ? 'rgba(0, 192, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)'),
            borderColor: formattedData.map(d => d.y >= d.open ? 'rgba(0, 192, 0, 1)' : 'rgba(255, 0, 0, 1)'),
            borderWidth: 1
        });
    } else {
        // Line chart
        chart.data.datasets.push({
            label: company,
            data: formattedData,
            borderColor: '#00c2ff',
            backgroundColor: 'rgba(0, 194, 255, 0.2)',
            fill: true,
            tension: 0.4
        });
    }

    // Update chart labels
    chart.data.labels = formattedData.map(d => d.x);

    // Update chart
    chart.update();

    // Update statistics
    updateStatistics(company);
    
    showLoading(false);
}

// Update comparison chart
function updateComparisonChart() {
    if (!comparisonChart || comparedCompanies.length === 0) return;
    
    showLoading(true);
    
    // Clear existing datasets
    comparisonChart.data.datasets = [];
    
    // Colors for different companies
    const colors = [
        { border: 'rgba(0, 123, 255, 1)', background: 'rgba(0, 123, 255, 0.2)' },
        { border: 'rgba(220, 53, 69, 1)', background: 'rgba(220, 53, 69, 0.2)' },
        { border: 'rgba(40, 167, 69, 1)', background: 'rgba(40, 167, 69, 0.2)' },
        { border: 'rgba(255, 193, 7, 1)', background: 'rgba(255, 193, 7, 0.2)' },
        { border: 'rgba(111, 66, 193, 1)', background: 'rgba(111, 66, 193, 0.2)' },
    ];
    
    // Find the earliest date across all compared companies to normalize
    let earliestDate = new Date();
    let allDates = [];
    
    comparedCompanies.forEach(company => {
        const data = getFilteredCompanyData(company);
        if (data.length > 0) {
            const companyEarliestDate = data[0].x;
            if (companyEarliestDate < earliestDate) {
                earliestDate = companyEarliestDate;
            }
            allDates = allDates.concat(data.map(d => d.x));
        }
    });
    
    // Use all dates as labels
    allDates = [...new Set(allDates.map(d => d.toISOString()))].map(d => new Date(d)).sort((a, b) => a - b);
    comparisonChart.data.labels = allDates;
    
    // Add normalized datasets for each company
    comparedCompanies.forEach((company, index) => {
        const data = getFilteredCompanyData(company);
        
        if (data.length === 0) return;
        
        // Find the starting value to normalize against
        const startValue = data[0].y;
        
        // Normalize all values as percentage of starting value
        const normalizedData = data.map(d => ({
            x: d.x,
            y: (d.y / startValue * 100).toFixed(2)
        }));
        
        // Add to chart
        comparisonChart.data.datasets.push({
            label: company,
            data: normalizedData,
            borderColor: colors[index % colors.length].border,
            backgroundColor: colors[index % colors.length].background,
            fill: false,
            tension: 0.4
        });
    });
    
    comparisonChart.update();
    showLoading(false);
}

// Update statistics panel
function updateStatistics(company) {
    const statsPanel = document.getElementById('statsPanel');
    const data = getFilteredCompanyData(company);
    
    if (data.length === 0) {
        statsPanel.innerHTML = '<p class="text-center text-muted">No data available</p>';
        return;
    }
    
    // Calculate statistics
    const currentPrice = data[data.length - 1].y;
    const previousPrice = data.length > 1 ? data[data.length - 2].y : 0;
    const startPrice = data[0].y;
    
    const dailyChange = currentPrice - previousPrice;
    const dailyChangePercent = ((dailyChange / previousPrice) * 100).toFixed(2);
    
    const overallChange = currentPrice - startPrice;
    const overallChangePercent = ((overallChange / startPrice) * 100).toFixed(2);
    
    // Find highest and lowest prices
    const highest = Math.max(...data.map(d => d.y));
    const lowest = Math.min(...data.map(d => d.y));
    
    // Calculate average
    const average = (data.reduce((sum, d) => sum + d.y, 0) / data.length).toFixed(2);
    
    // Create statistics HTML
    statsPanel.innerHTML = `
        <div class="stat-card bg-light">
            <div class="stat-value">${currentPrice.toFixed(2)}</div>
            <div class="stat-label">Current Value</div>
        </div>
        
        <div class="stat-card ${dailyChange >= 0 ? 'bg-light' : 'bg-light'}">
            <div class="stat-value ${dailyChange >= 0 ? 'positive' : 'negative'}">
                ${dailyChange >= 0 ? '+' : ''}${dailyChange.toFixed(2)} (${dailyChange >= 0 ? '+' : ''}${dailyChangePercent}%)
            </div>
            <div class="stat-label">Daily Change</div>
        </div>
        
        <div class="stat-card ${overallChange >= 0 ? 'bg-light' : 'bg-light'}">
            <div class="stat-value ${overallChange >= 0 ? 'positive' : 'negative'}">
                ${overallChange >= 0 ? '+' : ''}${overallChange.toFixed(2)} (${overallChange >= 0 ? '+' : ''}${overallChangePercent}%)
            </div>
            <div class="stat-label">Overall Change</div>
        </div>
        
        <div class="stat-card bg-light">
            <div class="stat-value">${highest.toFixed(2)}</div>
            <div class="stat-label">Highest</div>
        </div>
        
        <div class="stat-card bg-light">
            <div class="stat-value">${lowest.toFixed(2)}</div>
            <div class="stat-label">Lowest</div>
        </div>
        
        <div class="stat-card bg-light">
            <div class="stat-value">${average}</div>
            <div class="stat-label">Average</div>
        </div>
    `;
}

// Setup Dark Mode Toggle
function setupDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');

    // Load dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
        if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
    }

    // Toggle Dark Mode
    darkModeToggle.addEventListener('change', function () {
        body.classList.toggle('dark-mode');

        // Change icon
        if (themeIcon) {
            if (body.classList.contains('dark-mode')) {
                themeIcon.classList.replace('fa-moon', 'fa-sun');
            } else {
                themeIcon.classList.replace('fa-sun', 'fa-moon');
            }
        }

        // Save preference
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.removeItem('darkMode');
        }

        // Update chart themes
        updateChartTheme();
    });
}

// Update chart theme based on dark mode
function updateChartTheme() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // Common chart options for dark/light mode
    const textColor = isDarkMode ? '#fff' : '#666';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Update main chart theme
    if (chart) {
        chart.options.scales.x.grid.color = gridColor;
        chart.options.scales.y.grid.color = gridColor;
        chart.options.scales.x.ticks.color = textColor;
        chart.options.scales.y.ticks.color = textColor;
        chart.options.scales.x.title.color = textColor;
        chart.options.scales.y.title.color = textColor;
        chart.update();
    }

    // Update comparison chart
    if (comparisonChart) {
        comparisonChart.options.scales.x.grid.color = gridColor;
        comparisonChart.options.scales.y.grid.color = gridColor;
        comparisonChart.options.scales.x.ticks.color = textColor;
        comparisonChart.options.scales.y.ticks.color = textColor;
        comparisonChart.options.scales.x.title.color = textColor;
        comparisonChart.options.scales.y.title.color = textColor;
        comparisonChart.options.plugins.legend.labels.color = textColor;
        comparisonChart.update();
    }

    // ✅ **ADD THIS CODE BELOW** ✅
    
    // Update statistics text color in dark mode
    // ✅ Update statistics text color dynamically
document.querySelectorAll('.stat-value').forEach(el => {
    const value = parseFloat(el.textContent.replace(/[^\d.-]/g, '')); // Extract numeric value
    if (!isNaN(value)) {
        if (value > 0) {
            el.style.color = "limegreen"; // Green for positive values
            el.classList.add('positive');
            el.classList.remove('negative');
        } else if (value < 0) {
            el.style.color = "red"; // Red for negative values
            el.classList.add('negative');
            el.classList.remove('positive');
        } else {
            el.style.color = document.body.classList.contains('dark-mode') ? "#fff" : "#000"; // Default color
            el.classList.remove('positive', 'negative');
        }
    }
});


    document.querySelectorAll('.stat-label').forEach(el => {
        el.style.color = isDarkMode ? '#ddd' : '#666'; // Light gray in dark mode, dark gray in light mode
    });
}