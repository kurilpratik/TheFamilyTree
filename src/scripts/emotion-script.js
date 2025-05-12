//NAVBAR

const navbar = document.querySelector("nav");
const header = document.querySelector("header");
const logoImg = document.querySelector(".logo-img")

const headerOptions = {
    rootMargin: "-100px 0px 0px 0px"
};

const headerObserver = new IntersectionObserver(function(
    entries,
    headerObserver
){
    entries.forEach(entry => {
        //console.log(entry.target)
        if(!entry.isIntersecting){
            navbar.classList.add("navbar-scrolled")
            logoImg.src = "/assets/emotion-centre-logo-horizontal-red.png";
        } else {
            navbar.classList.remove("navbar-scrolled")
            logoImg.src = "/assets/emotion-centre-logo-horizontal.png";
        }
    });
}, 
headerOptions);

headerObserver.observe(header);

//Mobile Navbar

const mobileNavbar = document.querySelector(".navbar");
const mobileLogoImg = document.querySelector(".mobile-logo-img")
const mobileHeaderObserver = new IntersectionObserver(function(
    entries,
    mobileHeaderObserver
){
    entries.forEach(entry => {
        //console.log(entry.target)
        if(!entry.isIntersecting){
            mobileNavbar.classList.add("navbar-mobile-scrolled")
            mobileLogoImg.src = "/assets/emotion-centre-logo-horizontal-red.png";
        } else {
            mobileNavbar.classList.remove("navbar-mobile-scrolled")
            mobileLogoImg.src = "/assets/emotion-centre-logo-horizontal.png";
        }
    });
}, 
headerOptions);

mobileHeaderObserver.observe(header);



