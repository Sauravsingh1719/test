'use client'
import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import axios from 'axios'
import SkeletonCard from './SkeletonLoading'

function Category() {

        const [category, setCategory] = useState('')
        const [error, setError] = useState('')

       async function fetchCategory() {
            try {
                const response = await axios.get('/api/categories');
                if (response.data.success) {
                setCategory(response.data.data);
                setError(null);
                } else {
                setError('Failed to fetch stats');
                }
            } catch (error) {
                console.error(error);
                setError('Failed to fetch category'); 
            }
            }

            useEffect(() => {
                fetchCategory();
            }, []);

            if (error) {
                return <div className="text-red-500 font-semibold">{error}</div>;
              }
            
              if (!category) {
                return <div><SkeletonCard/></div>;
              }

              if(category.length === 0) {
                return <div className="text-red-500 font-semibold">No category found</div>;
              }
  return (
    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 px-40 py-10">
        {category.map((cat:any) => (
          <Card key={cat.id} className='flex items-center uppercase '>
              <CardContent>
                  <h3 className="font-bold text-2xl">{cat.name}</h3>
              </CardContent>
          </Card>
        ))}
    </div>
  )
}

export default Category