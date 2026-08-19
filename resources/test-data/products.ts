export const products = {
  backpack: {
    name: 'Sauce Labs Backpack',
    price: '$29.99',
    slug: 'sauce-labs-backpack',
  },
  bikeLight: {
    name: 'Sauce Labs Bike Light',
    price: '$9.99',
    slug: 'sauce-labs-bike-light',
  },
  boltTShirt: {
    name: 'Sauce Labs Bolt T-Shirt',
    price: '$15.99',
    slug: 'sauce-labs-bolt-t-shirt',
  },
  fleeceJacket: {
    name: 'Sauce Labs Fleece Jacket',
    price: '$49.99',
    slug: 'sauce-labs-fleece-jacket',
  },
  onesie: {
    name: 'Sauce Labs Onesie',
    price: '$7.99',
    slug: 'sauce-labs-onesie'
  },
  allTheThings: {
    name:'Test.allThings() T-Shirt (Red)',
    price: '$15.99',
    slug: 'test.allthethings()-t-shirt-(red)'
  },
};

export type Product = (typeof products)[keyof typeof products];