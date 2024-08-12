
const axios = require('axios')
const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology:true})

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", () => {
    console.log("Database connected")
});

const sample = (array) => array[Math.floor(Math.random() * array.length)]

  // call unsplash and return small image
  async function seedImg() {
    try {
      const resp = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
          client_id: 'uT_tUkkuQdCwNL2BK1daTDJWmsEHvzNAXvVwspRObJ4',
          collections: 1114848,
        },
      })
      return resp.data.urls.small
    } catch (err) {
      console.error(err)
    }
  }

const seedDB = async() => {
    await Campground.deleteMany({});
   for (let i=0;i<20;i++){
    const price = Math.floor(Math.random()*20);
    const random1000 = Math.floor(Math.random() * 1000)
    const placeSeed = Math.floor(Math.random() * places.length)
    const descriptorsSeed = Math.floor(Math.random() * descriptors.length)
    const citySeed = Math.floor(Math.random() * cities.length)
    const camp = new  Campground({
        // image: await seedImg(),
        author:'66854af131be77a099b682c6',
        // image: 'https://source.unsplash.com/collection/433251',
        location: `${cities[random1000].city}, ${cities[random1000].state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        description:
        'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Debitis, nihil tempora vel aspernatur quod aliquam illum! Iste impedit odio esse neque veniam molestiae eligendi commodi minus, beatae accusantium, doloribus quo!',
     price,
     images: [
      {
          url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png',
          filename: 'YelpCamp/ahfnenvca4tha00h2ubt'
      },
      {
          url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png',
          filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi'
      }
  ]
    })
    await camp.save();
}
   
}

seedDB().then (() => {
    mongoose.connection.close()
});