import { Typography, Stack } from '@mui/material'
import LabeledInputBox from '@/components/LabeledInputBox'
import LinkButton from '@/components/LinkButton'
import { useEffect, useState } from 'react'
import { localPort } from '@/utils/constants'
import { useRouter } from 'next/router'
// import { socketInit } from '../utils/socket'/

export default function Login() {
  const router = useRouter()
  const isAfterSignUp = 'afterSignUp' in router.query

  const [failed, setFailed] = useState(false)

  const [form, setForm] = useState({
    userId: '',
    password: '',
  })

  const [isLogged, setIsLogged] = useState(true)

  useEffect(() => {
    if (localStorage.getItem('token')) {
      router.push('/workspace') // TODO: change routing page
    } else {
      setIsLogged(false)
    }
  }, [router])

  const handleLogin = async ({ id, token }: { id: string; token: string }) => {
    localStorage.setItem('_id', id)
    localStorage.setItem('token', token)
    // socket.emit('connection')
    // socket.emit('init', { userId: id })
    // socketInit(id)
    router.push('/workspace') // TODO: change routing page
  }

  const handleOnClick = async () => {
    if (form.userId === '' || form.password === '') {
      return
    }
    try {
      const res = await fetch(`${localPort}/users/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })
      const data: {
        _id: string
        token: string
      } = await res.json()
      handleLogin({
        id: data._id,
        token: data.token,
      }) /* eslint no-underscore-dangle: 0 */
    } catch (err) {
      setFailed(true)
    }
  }

  return (
    !isLogged && (
      <div style={{ height: '100vh' }}>
        <Stack
          spacing={3}
          justifyContent="center"
          alignItems="center"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingX: '400px',
            height: '100%',
          }}
        >
          <Stack
            justifyContent="center"
            alignItems="center"
            sx={{ marginBottom: '40px' }}
          >
            <Typography
              variant="h2"
              sx={{ fontWeight: '900', color: '#2f6eba', marginBottom: '20px' }}
            >
              Log In
            </Typography>
            <Typography
              variant="h5"
              display={isAfterSignUp ? '' : 'none'}
              color="#2f6eba"
            >
              Welcome! Your account has been successfully created!
            </Typography>
            <Typography
              variant="body1"
              display={isAfterSignUp ? '' : 'none'}
              color="#2f6eba"
            >
              Please log in to continue
            </Typography>
          </Stack>
          <LabeledInputBox
            label="ID"
            value=""
            onChange={(e) => {
              setForm((prev) => ({ ...prev, userId: e.target.value }))
              setFailed(false)
            }}
          />
          <LabeledInputBox
            label="Password"
            value=""
            style={{ marginBottom: '60px' }}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, password: e.target.value }))
              setFailed(false)
            }}
            onEnter={handleOnClick}
          />
          <Stack justifyContent="center" alignItems="center" spacing={1}>
            <Typography
              variant="caption"
              color="#CE0101"
              style={{ visibility: failed ? 'visible' : 'hidden' }}
            >
              Failed to log in. Try agin after check your id or password.
            </Typography>
            <LinkButton
              onClick={handleOnClick}
              disabled={form.userId === '' || form.password === ''}
            >
              Log in
            </LinkButton>
          </Stack>
          <LinkButton href="/signup" style={{ background: 'gray' }}>
            Sign up
          </LinkButton>
        </Stack>
      </div>
    )
  )
}
