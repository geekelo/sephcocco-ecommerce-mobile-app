import { Layout } from '@/components/layout/Layout'
import CompletedOrders from '@/components/order/completed'
import OrdersScreen from '@/components/order/order'
import React from 'react'

function CompletedOrder() {
  return (
    <Layout>
        <CompletedOrders />
    </Layout>
  )
}

export default CompletedOrder