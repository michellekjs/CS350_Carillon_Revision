import {
  Button,
  Typography,
  Stack,
  Grid,
  TextField,
  styled,
  Collapse,
} from '@mui/material'
import LabeledInputBox from '@/components/LabeledInputBox'
import LinkButton from '@/components/LinkButton'
import React, { useState, useEffect } from 'react'
import { localPort } from '@/utils/constants'
import { useRouter } from 'next/router'

export default function SignUp() {
  const router = useRouter()

  const [isLogged, setIsLogged] = useState(true)

  useEffect(() => {
    if (localStorage.getItem('token')) {
      router.push('/workspace') // TODO: change routing page
    } else {
      setIsLogged(false)
    }
  }, [router])

  const [failed, setFailed] = useState(false)

  const [form, setForm] = useState({
    userId: '',
    password: '',
    userName: '',
    email: '',
  })

  const [valid, setValid] = useState(true)
  function validate(password: string) {
    // At least 10 characters by combining two or more of English letters, numbers, and special characters (English letter required),
    // or at least 8 characters by combining all English letters, numbers, and special characters.
    // Valid special chracters include !, @, #, $, %, ^, &, or *. Referenced from https://www.ibm.com/support/pages/password-policy-and-passwords-special-characters:
    const regex =
      /(?=.*[a-zA-Z])(?=.*[0-9!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{10,}|(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}/
    setValid(regex.test(password))
  }
  const [emailState, setEmailState] = useState(0) // 0 before sending email, 1 after sending email, 2 after email is authorized, -1 if failed to send email, -2 if code is wrong

  const [ready, setReady] = useState(false)
  useEffect(() => {
    setFailed(false)
    validate(form.password)
    if (
      form.userId !== '' &&
      form.password !== '' &&
      form.userName !== '' &&
      form.email !== ''
    ) {
      setReady(true)
    } else {
      setReady(false)
    }
  }, [form])

  const handleOnClick = async () => {
    if (!ready || !valid || emailState !== 2) {
      return
    }
    try {
      const res = await fetch(`${localPort}/users/signup`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })
      await res.json()
      router.push(
        {
          pathname: '/login',
          query: { afterSignUp: true },
        },
        '/login',
      )
    } catch (err) {
      setFailed(true)
    }
  }

  const styles: { [key: string]: React.CSSProperties } = {
    label: {
      display: 'flex',
      justifyContent: 'left',
      alignItems: 'end',
      height: '100%',
    },
  }

  const EmailField = styled(TextField)({
    '& .Mui-disabled:before': {
      borderBottomStyle: 'solid',
    },
    '& .MuiInputBase-input': {
      borderBottomStyle: 'solid',
      color: 'black',
      WebkitTextFillColor: 'black',
    },
  })

  const [code, setCode] = useState('')

  const sendEmail = async () => {
    setEmailState(1)
    const body = {
      email: `${form.email}@kaist.ac.kr`,
    }
    try {
      const res = await fetch(`${localPort}/users/email`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      const data = await res.text()
      if (data !== 'OK') {
        throw new Error('Email sent error')
      }
    } catch (err) {
      setEmailState(-1)
    }
  }

  const verifyCode = async () => {
    const body = {
      email: `${form.email}@kaist.ac.kr`,
      authCode: code,
    }
    try {
      const res = await fetch(`${localPort}/users/verify`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      const data = await res.text()
      if (data !== 'OK') {
        throw new Error('Code verify error')
      } else {
        setEmailState(2)
      }
    } catch (err) {
      setEmailState(-2)
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
          <Typography
            variant="h2"
            sx={{ fontWeight: '900', color: '#2f6eba', marginBottom: '60px' }}
          >
            Sign Up
          </Typography>
          <LabeledInputBox
            label="ID"
            value=""
            onChange={(e) => {
              setForm((prev) => ({ ...prev, userId: e.target.value }))
            }}
          />
          <Stack style={{ width: '100%' }}>
            <LabeledInputBox
              label="Password"
              value=""
              type="password"
              onChange={(e) => {
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }}
            />
            <Typography
              variant="caption"
              color="#CE0101"
              display={valid || form.password === '' ? 'none' : ''}
            >
              At least 10 characters including English letters and numbers or
              special characters. At least 8 characters including all three.
              Only !, @, #, $, %, ^, &, and * are allowed for the special
              characters.
            </Typography>
          </Stack>
          <Grid container alignItems="center" justifyContent="center">
            <Grid item xs={4}>
              <div style={styles.label}>
                <Typography>KAIST Email</Typography>
              </div>
            </Grid>
            <Grid item xs={8}>
              <Grid container alignItems="center" justifyContent="center">
                <Grid item xs={6}>
                  <TextField
                    variant="standard"
                    placeholder="KAIST Email"
                    fullWidth
                    value={form.email}
                    type="text"
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                      if (emailState !== 0) {
                        setEmailState(0)
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') sendEmail()
                    }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <EmailField
                    variant="standard"
                    value="@kaist.ac.kr"
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={3} width="100%">
                  <Button
                    fullWidth
                    sx={{ marginTop: '-4px', textTransform: 'none' }}
                    onClick={sendEmail}
                    disabled={
                      emailState === 1 || emailState === 2 || emailState === -2
                    }
                  >
                    {emailState === 1 || emailState === 2 || emailState === -2
                      ? 'Code Sent'
                      : 'Send Code'}
                  </Button>
                </Grid>
                <Grid
                  item
                  xs={12}
                  style={{
                    display: emailState === -1 ? 'flex' : 'none',
                    justifyContent: 'end',
                  }}
                >
                  <Typography variant="caption" color="#CE0101">
                    Failed to send an email. Please try again.
                  </Typography>
                </Grid>
                <Grid item xs={12} paddingTop={emailState === 2 ? 1 : 0}>
                  <Collapse
                    in={
                      emailState === 1 || emailState === 2 || emailState === -2
                    }
                  >
                    <Grid container paddingTop={0.5} rowSpacing={1}>
                      <Grid item xs={12}>
                        <Collapse in={emailState !== 2}>
                          <Typography variant="caption" color="#2f6eba">
                            {`We emailed you a verification code. Please enter the verification code sent to ${form.email}@kaist.ac.kr.`}
                          </Typography>
                        </Collapse>
                      </Grid>
                      <Grid item xs={9}>
                        <TextField
                          variant="standard"
                          placeholder="Verification Code"
                          fullWidth
                          sx={{ textAlign: 'right !important' }}
                          onChange={(e) => setCode(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && emailState === 1)
                              verifyCode()
                          }}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <Button
                          fullWidth
                          sx={{ marginTop: '-4px', textTransform: 'none' }}
                          onClick={verifyCode}
                          disabled={emailState === 2}
                        >
                          {emailState === 2 ? 'Verified' : 'Verify'}
                        </Button>
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      style={{
                        display: emailState === -2 ? 'flex' : 'none',
                        justifyContent: 'end',
                      }}
                    >
                      <Typography variant="caption" color="#CE0101">
                        Failed to verify. Please try again.
                      </Typography>
                    </Grid>
                  </Collapse>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <LabeledInputBox
            label="Name"
            value=""
            style={{ marginBottom: '60px' }}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, userName: e.target.value }))
            }}
            onEnter={handleOnClick}
          />
          <Stack justifyContent="center" alignItems="center" spacing={1}>
            <LinkButton
              onClick={handleOnClick}
              disabled={!ready || !valid || emailState !== 2}
            >
              Sign up
            </LinkButton>
            <Typography
              variant="caption"
              color="#CE0101"
              style={{ visibility: failed ? 'visible' : 'hidden' }}
            >
              Failed to sign up. Please try again.
            </Typography>
          </Stack>
        </Stack>
      </div>
    )
  )
}
