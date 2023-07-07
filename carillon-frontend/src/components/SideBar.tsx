import * as React from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { localPort } from '@/utils/constants'
import { IUser, IWorkspace, IChannel } from '@/utils/types'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import useWindowDimensions from './WindowSize'
import style from './SideBar.module.css'
import Notifier from './Notifier'

interface WorkspacesProps {
  users: IUser[]
  workspaces: IWorkspace[]
  channels: IChannel[]
}
type Child = {
  children: React.ReactNode
}

export default function SideBar(
  { children }: Child,
  { users, workspaces, channels }: WorkspacesProps,
) {
  const router = useRouter()
  const [expanded, setExpanded] = React.useState<string | false>(false)
  const [includedWorkspace, setIncludedWorkspace] = useState<IWorkspace[]>([])
  // 해당 유저가 속한 워크스페이스의 목록
  const [userChannel, setUserChannel] = useState<IChannel[]>([])

  const styles = {
    accordion: {
      width: '150px',
      backgroundColor: '#2f6eba',
      color: 'white',
      border: 0,
      boxShadow: 0,
    },
  }
  // resizing the sidebar height
  const { height } = useWindowDimensions()
  let gap = 0
  let h = 0
  if (height) {
    gap = height - 500
    h = height
  }
  // logout function
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  // handling accordion design
  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false)
    }

  // get list of workspaces that the user belongs to\

  async function getUser() {
    // Get Current User -> filteredList[0] is the current user in IUSER form
    const filteredList: IUser[] = users.filter(
      (u: any) => localStorage.getItem('_id') === u._id,
    )
    // Get workspace list that the user is included in using IWorkspace form
    const filteredWorkspace: IWorkspace[] = workspaces.filter((a: any) =>
      filteredList[0].participatingWorkspaces.includes(a._id),
    )

    // Get all channels the user is included in
    const filteredChannel: IChannel[] = channels.filter((c: any) =>
      filteredList[0].participatingChannels.includes(c._id),
    )
    // Get the channel included in the current workspace
    const finalfilteredChannel: IChannel[] = filteredChannel.filter(
      (c: any) => c.workspace.name === router.query.classCode,
    )

    setIncludedWorkspace(filteredWorkspace)

    if (router.query.classCode == null) {
      setUserChannel(filteredChannel)
    } else {
      setUserChannel(finalfilteredChannel)
    }
  }

  useEffect(() => {
    getUser()
  })

  // getUser()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          marginTop: '10px',
          marginLeft: '10px',
          alignItems: 'center',
        }}
      >
        <Image src="/logo.svg" height={30} width={30} alt="logo" />
        <Link
          href="/workspace"
          style={{
            fontSize: '18pt',
            fontWeight: '900',
            color: '#2f6eba',
            marginLeft: '5px',
            textDecoration: 'none',
            width: '100%',
          }}
        >
          {' '}
          Carrilon{' '}
        </Link>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '90%',
          justifyContent: 'center',
          margin: '10px',
          overflowX: 'hidden',
        }}
      >
        <div
          style={{
            marginRight: '40px',
            height: h,
          }}
        >
          <div
            style={{
              width: '200px',
              backgroundColor: '#2f6eba',
              height: '90vh',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              padding: '10px',
            }}
          >
            <div style={{ margin: '10px', color: 'white', fontWeight: 'bold' }}>
              {router.query.classCode == null
                ? 'Select a workspace'
                : router.query.classCode}
            </div>
            <div style={{ width: '90%', borderTop: '1px solid white' }} />
            <Accordion
              expanded={expanded === 'workspace'}
              onChange={handleChange('workspace')}
              sx={styles.accordion}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography> Workspace </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: gap,
                }}
              >
                <div>
                  {includedWorkspace &&
                    includedWorkspace.map((workspace: any) => (
                      <Link
                        key={workspace.id}
                        href={`/workspace/${workspace.name}`}
                        className={style.accordionChild}
                      >
                        {workspace.name}
                        <br />
                      </Link>
                    ))}
                </div>
                <Link href="/workspace"> New Workspace </Link>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={expanded === 'channels'}
              onChange={handleChange('channels')}
              sx={styles.accordion}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography> Channels </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ height: gap }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {userChannel &&
                    userChannel.map((c: any) => (
                      <Link
                        key={c}
                        href={`/workspace/cs350/channel/${c._id}`}
                        className={style.accordionChild}
                      >
                        {c.name}
                      </Link>
                    ))}
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={expanded === 'dm'}
              onChange={handleChange('dm')}
              sx={styles.accordion}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel3a-content"
                id="panel3a-header"
              >
                <Typography> DM </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ height: gap }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Link
                    href="/workspace/cs350/Sally"
                    className={style.accordionChild}
                  >
                    {' '}
                    Sally{' '}
                  </Link>
                  <Link
                    href="/workspace/cs350/Sam"
                    className={style.accordionChild}
                  >
                    {' '}
                    Sam{' '}
                  </Link>
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={expanded === 'myinfo'}
              onChange={handleChange('myinfo')}
              sx={styles.accordion}
            >
              <AccordionSummary
                aria-controls="panel3a-content"
                id="panel3a-header"
              >
                <div>
                  <Link href="/mypage" className={style.accordionChild}>
                    <Typography> My Informaion </Typography>
                  </Link>
                </div>
              </AccordionSummary>
            </Accordion>
            <div
              style={{ display: 'flex', bottom: '40px', position: 'absolute' }}
            >
              <Image src="/logout.png" height={30} width={30} alt="logo" />
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '12pxs',
                }}
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        <div style={{ width: '90%' }}>{children}</div>
        <Notifier />
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  const options = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  }
  const userList = await fetch(`${localPort}/users/`, options)
  const users = await userList.json()

  const workspaceList = await fetch(`${localPort}/workspaces/`, options)
  const workspaces = await workspaceList.json()

  const channelList = await fetch(`${localPort}/channels/`, options)
  const channels = await channelList.json()

  return {
    props: { users, workspaces, channels },
  }
}
