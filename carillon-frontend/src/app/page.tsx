import React from 'react'
import LinkButton from '@/components/LinkButton'
import styles from '../pages/auth.module.css'
import Title from './title'

export default function MainPage() {
  return (
    <div className={styles.format}>
      <Title />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <LinkButton href="/login">Log In</LinkButton>
        <LinkButton href="/signup">Sign Up</LinkButton>
      </div>
    </div>
  )
}
