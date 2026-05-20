import Hero from '../components/Hero/Hero'
import Features from '../components/Features/Features'
import Bestsellers from '../components/Products/Bestsellers'
import WhyUs from '../components/WhyUs/WhyUs'
import Reviews from '../components/Reviews/Reviews'
import { Helmet } from 'react-helmet'

export default function HomePage() {
  return (
    <>
      <title>ODISHASHOP — Premium Quality, Honest Price</title>
      <Hero />
      <Features />
      <Bestsellers />
      <WhyUs />
      <Reviews />
    </>
  )
}
