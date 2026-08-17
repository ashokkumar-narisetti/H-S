import fs from 'fs';

const dummyImages = [
  '"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"',
  '"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop"',
  '"https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop"',
  '"https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop"',
  '"https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"'
];

let content = fs.readFileSync('src/data/products.js', 'utf8');

const regex = /images:\s*\[.*?\],/gs;

content = content.replace(regex, (match) => {
  const originalImages = match.match(/"(.*?)"/g);
  let newImages = [];
  
  if (originalImages && originalImages.length > 0) {
     newImages.push(originalImages[0]);
  } else {
     newImages.push(dummyImages[0]);
  }
  
  while(newImages.length < 5) {
     newImages.push(dummyImages[newImages.length]);
  }
  
  return `images: [\n      ${newImages.join(',\n      ')}\n    ],`;
});

fs.writeFileSync('src/data/products.js', content, 'utf8');
console.log('Images updated successfully.');
