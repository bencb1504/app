document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
      const imgs = document.getElementsByClassName('rotate');
      if(imgs.length > 0) {
        for (let img of imgs) {
          EXIF.getData(img, function() {
              const orientation = EXIF.getTag(this, "Orientation");
              if (orientation === 6) {
                  img.setAttribute('style', 'transform: rotate(90deg)');
              }
          });
        }
      }
  }, 1000);
}, true);
