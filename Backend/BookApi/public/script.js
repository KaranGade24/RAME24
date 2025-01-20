const bannerSliderImages = document.querySelector(".banner-slider");

const imagesUrl = [
  "./images/Rame_books.png",
  "./images/RAME_PUBLISHERS_Banner.png",
  "./images/conferance.png",
  "./images/ResearchAssociation_banner.png",
];

let i = 0;
setInterval(() => {
  bannerSliderImages.style.backgroundImage = `url(${imagesUrl[i]})`;
  i++;
  if (i == 4) {
    i = 0;
  }
}, 5598);
