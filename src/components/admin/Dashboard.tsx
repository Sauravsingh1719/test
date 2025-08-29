import React from 'react'
import Total from './Total'
import TestCreate from '../Testcreate'
import StudentTestList from '../student/TestList'

const Dashboard = () => {
  return (
    <div>
      <div><Total/></div>
      <div><TestCreate/></div>
      <div><StudentTestList/></div>
    </div>
  )
}

export default Dashboard