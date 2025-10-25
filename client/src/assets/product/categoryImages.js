// src/assets/product/categoryImages.js

export function getCategoryImage(name) {
  switch (name) {
    case "Black Pepper":
      return "https://images.unsplash.com/photo-1591801058986-9e28e68670f7?q=80&w=1228&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    case "Herbs":
      return "https://plus.unsplash.com/premium_photo-1693266635481-37de41003239?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    case "Cinnamon":
      return "https://images.unsplash.com/photo-1601379758962-cadba22b1e3a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    case "Cardamom":
      return "https://images.unsplash.com/photo-1701190588800-67a7007492ad?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    case "White Pepper":
      return "https://media.istockphoto.com/id/2159774748/photo/white-pepper-or-peppercorns-in-wooden-spoon-with-bowl.jpg?s=2048x2048&w=is&k=20&c=8E_80C-Xsj_iCRfzfJSwlTKUqmxrGKy5-puKqfc8glc=";
    case "Blends":
      return "https://media.istockphoto.com/id/2195466084/photo/curry-powder.jpg?s=2048x2048&w=is&k=20&c=BMSyanE-Q-2Sja8JrSeATaaEHW_R_V_4icRo0H0ioXs=";
    case "Spices":
      return "https://images.unsplash.com/photo-1532336414038-cf19250c5757?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    case "Turmeric":
      return "https://media.istockphoto.com/id/1135096233/photo/turmeric-roots-and-powder-shot-from-above.jpg?s=1024x1024&w=is&k=20&c=nDLLBL0qFwsYlzjPu2Hp5RpUzi5KtLRkSD4gpZL8Y5A=";
    case "Chili Powder":
      return "https://images.unsplash.com/photo-1625921133217-8d978f7872b8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740";
    case "Unroasted Curry Powder":
      return "https://media.istockphoto.com/id/1251037599/photo/cumin.webp?s=1024x1024&w=is&k=20&c=YpBonJuGmeSOdNjaEg0pizcQSOClH3Nz7jLaTqOVy0s=";
    // Add other cases as needed
    default:
      return "https://images.unsplash.com/photo-1532336414038-cf19250c5757?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8c3BpY2VzfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=900";
  }
}
