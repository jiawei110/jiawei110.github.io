/*!
* Start Bootstrap - Resume v7.0.6 (https://startbootstrap.com/theme/resume)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE)
*/
//
// Scripts
// 





var portfolio_details = [];
var portfolio_index_listener = 0;
// Fetch JSON file
fetch('assets/json/portfolio_details.json')
    .then(response => response.json())
    .then(data => {
        portfolio_details = data.portfolio_details.projects;
        console.log(portfolio_details);
    })
    .catch(error => console.error('Error fetching JSON:', error));


// run after fetch is done
window.addEventListener('load', function () {
    const portfolio_title = document.getElementById('portfolio-title');
    const portfolio_decription = document.getElementById('portfolio-description');
    const portfolio_github = document.getElementById('portfolio-github-link');

    portfolio_title.innerHTML = portfolio_details[0].title;
    portfolio_decription.innerHTML = portfolio_details[0].description;
    portfolio_github.href = portfolio_details[0].github;
});


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const sideNav = document.body.querySelector('#sideNav');
    if (sideNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#sideNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});

//window listen to keyboard events
window.addEventListener('keydown', function (e) {
    //d key to move too next portfolio
    if (e.key === 'd') {
        const portfolio_title = this.document.getElementById('portfolio-title');
        const portfolio_decription = this.document.getElementById('portfolio-description');
        const portfolio_github_link = this.document.getElementById('portfolio-github-link');
        const portfolio_github_icon = this.document.getElementById('portfolio-github-icon');
        portfolio_decription.style.display = "block";
        portfolio_github_icon.style.display = "block";

        if (portfolio_index_listener+1 >= portfolio_details.length) {
            portfolio_index_listener = 0;
        }
        else{
            portfolio_index_listener++;
        }
        portfolio_title.innerHTML = portfolio_details[portfolio_index_listener].title;
        portfolio_decription.innerHTML = portfolio_details[portfolio_index_listener].description;
        portfolio_github_link.href = portfolio_details[portfolio_index_listener].github;

    }

    //a key to move to previous portfolio
    if (e.key === 'a') {
        const portfolio_title = this.document.getElementById('portfolio-title');
        const portfolio_decription = this.document.getElementById('portfolio-description');
        const portfolio_github_link = this.document.getElementById('portfolio-github-link');
        const portfolio_github_icon = this.document.getElementById('portfolio-github-icon');
        portfolio_decription.style.display = "block";
        portfolio_github_icon.style.display = "block";

        if (portfolio_index_listener-1 < 0) {
            portfolio_index_listener = portfolio_details.length-1;
        }
        else{
            portfolio_index_listener++;
        }
        portfolio_title.innerHTML = portfolio_details[portfolio_index_listener].title;
        portfolio_decription.innerHTML = portfolio_details[portfolio_index_listener].description;
        portfolio_github_link.href = portfolio_details[portfolio_index_listener].github;

    }

    //space key to show or hide portfolio details & able or disable github link
    if (e.key === ' ') {
        const portfolio_decription = this.document.getElementById('portfolio-description');
        const portfolio_github_icon = this.document.getElementById('portfolio-github-icon');
        console.log(portfolio_decription.style.display);
        if(portfolio_decription.style.display=== "none"){
            portfolio_decription.style.display = "block";
            portfolio_github_icon.style.display = "block";
        }
        else if(portfolio_decription.style.display === "block"){
            portfolio_decription.style.display = "none";
            portfolio_github_icon.style.display = "none";
        }
    }
});
