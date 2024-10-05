"use client"
import { useEffect, useState, useContext } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

import GlobalApi from '@/Shared/GlobalApi'
import BusinessList from '@/components/Home/BusinessList'
import CategoryList from '@/components/Home/CategoryList'
import GoogleMapView from '@/components/Home/GoogleMapView'
import RangeSelect from '@/components/Home/RangeSelect'
import SelectRating from '@/components/Home/SelectRating'
import SkeltonLoading from '@/components/SkeltonLoading'
import { UserLocationContext } from '@/context/UserLocationContext'

// Define types
type Business = any // Replace 'any' with a more specific type if available
type Category = string // Adjust if needed
type UserLocation = {
  lat: number
  lng: number
}

export default function Home() {
  const { data: session } = useSession()
  const [category, setCategory] = useState<Category | undefined>()
  const [radius, setRadius] = useState<number>(2500)
  const [businessList, setBusinessList] = useState<Business[]>([])
  const [businessListOrg, setBusinessListOrg] = useState<Business[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()
  const { userLocation, setUserLocation } = useContext(UserLocationContext) as { userLocation: UserLocation, setUserLocation: (location: UserLocation) => void }

  useEffect(() => {
    if (!session?.user) {
      router.push('/Login')
    }
  }, [session, router])

  useEffect(() => {
    getGooglePlace()
  }, [category, radius, userLocation])

  const getGooglePlace = () => {
    if (category) {
      setLoading(true)
      GlobalApi.getGooglePlace(category, radius, userLocation.lat, userLocation.lng)
        .then(resp => {
          setBusinessList(resp.data.product.results)
          setBusinessListOrg(resp.data.product.results)
          setLoading(false)
        })
    }
  }

  const onRatingChange = (rating: number[]) => {
    if (rating.length === 0) {
      setBusinessList(businessListOrg)
      return
    }
    const result = businessList.filter(item => 
      rating.some(r => item.rating >= r)
    )
    setBusinessList(result)
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-4'>
      <div className='p-3'>
        <CategoryList onCategoryChange={(value: Category) => setCategory(value)} />
        <RangeSelect onRadiusChange={(value: number) => setRadius(value)} />
        <SelectRating onRatingChange={(value: number[]) => onRatingChange(value)} />
      </div>
      <div className='col-span-3'>
        <GoogleMapView businessList={businessList} />
        <div className='md:absolute mx-2 w-[90%] md:w-[74%] bottom-36 relative md:bottom-3'>
          {!loading ? (
            <BusinessList businessList={businessList} />
          ) : (
            <div className='flex gap-3'>
              {[1,2,3,4,5].map((item, index) => (
                <SkeltonLoading key={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
