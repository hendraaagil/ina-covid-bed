import useSWR from 'swr'

import { getDistanceFromLatLonInKm } from '@/utils/LocationHelper'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function useHospitalDataByProvince(province, geo) {
  const { data: apiResult } = useSWR(
    `/api/bed?prov=${province}&revalidate=false`,
    fetcher
  )
  let hospitalList = null
  let bedFull = false

  if (apiResult?.full_bed) {
    bedFull = true
  }

  if (apiResult?.data) {
    hospitalList = apiResult.data.sort((a, b) => {
      if (a.available_bed === 0) {
        return 1
      } else if (b.available_bed === 0) {
        return -1
      }

      return b.available_bed > a.available_bed ? 1 : -1
    })

    if (geo) {
      // map distance so we calculate once
      hospitalList = hospitalList
        .map((hospital) => {
          const distance = getDistanceFromLatLonInKm(
            geo.lat,
            geo.lon,
            parseFloat(hospital.lat),
            parseFloat(hospital.lon)
          )

          return {
            ...hospital,
            distance,
          }
        })
        .sort((a, b) => {
          if (a.available_bed === 0) {
            return 1
          } else if (b.available_bed === 0) {
            return -1
          }

          return a.distance > b.distance ? 1 : -1
        })
    }
  }

  return { bedFull, hospitalList }
}
