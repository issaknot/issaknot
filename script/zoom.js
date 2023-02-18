function addZoomLogic(){
    const imgModal = document.createElement("div");
    imgModal.classList.add("img-modal");
  
    const img = document.createElement("img");
    img.classList.add("img-zoom");
  
    imgModal.appendChild(img);
    document.querySelector(".subsite_content").appendChild(imgModal);
  
    const showModal = (src) => {
      img.src = src;
      imgModal.style.display = "flex";
    };
  
    const hideModal = () => {
      imgModal.style.display = "none";
    };
  
    imgModal.addEventListener("click", hideModal);
  
    const images = document.querySelectorAll("img");
    for (const image of images) {
      console.log(image)
      image.addEventListener("click", () => showModal(image.src));
    }   
  }

  export { addZoomLogic }