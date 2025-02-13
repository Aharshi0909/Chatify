import React, { useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { getFirestore, collection, orderBy, limit, query, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

const firebaseConfig = {
  /*
  * Use
  * yours
  * pliz
  */
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const firestore = getFirestore(app)

const Home = ({ nav }) => (
  <div className="container-fluid vh-100 d-flex flex-column bg-dark text-white">
    <main className="flex-grow-1 d-flex flex-column justify-content-center align-items-center bg-secondary bg-opacity-25 p-4">
      <h2>Welcome</h2>
      <svg
        fill="white" // Changed fill color to white for visibility
        height="100" // Increased size
        width="100" // Increased size
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-3" // Added margin for spacing
      >
        <g>
          <path d="m12 22.81c-.69 0-1.34-.35-1.8-.96l-1.5-2c-.03-.04-.15-.09-.2-.1h-.5c-4.17 0-6.75-1.13-6.75-6.75v-5c0-4.42 2.33-6.75 6.75-6.75h8c4.42 0 6.75 2.33 6.75 6.75v5c0 4.42-2.33 6.75-6.75 6.75h-.5c-.08 0-.15.04-.2.1l-1.5 2c-.46.61-1.11.96-1.8.96zm-4-20.06c-3.58 0-5.25 1.67-5.25 5.25v5c0 4.52 1.55 5.25 5.25 5.25h.5c.51 0 1.09.29 1.4.7l1.5 2c.35.46.85.46 1.2 0l1.5-2c.33-.44.85-.7 1.4-.7h.5c3.58 0 5.25-1.67 5.25-5.25v-5c0-3.58-1.67-5.25-5.25-5.25z" />
          <path d="m12 12c-.56 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.44 1-1 1z" />
          <path d="m16 12c-.56 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.44 1-1 1z" />
          <path d="m8 12c-.56 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.44 1-1 1z" />
        </g>
      </svg>
      <div className="d-flex gap-2">
        <button className="btn btn-outline-light" onClick={() => nav('signup')}>Sign Up/Sign In</button>
        <button className="btn btn-outline-light" onClick={() => nav('chat')}>Chat</button>
      </div>
    </main>
  </div>
)

const SignUp = ({ nav }) => {
  const sIWG = () => {
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
  }

  return (
    <div className="container-fluid vh-100 d-flex flex-column bg-dark text-white">
      <main className="flex-grow-1 d-flex flex-column justify-content-center align-items-center bg-secondary bg-opacity-25 p-4">
        <button className="btn btn-danger btn-lg" onClick={sIWG}>
          <i className="bi bi-google me-2"></i>Sign In
        </button>
        <button className="btn btn-outline-light mt-3" onClick={() => nav('home')}>Home</button>
      </main>
    </div>
  )
}

const Chat = ({ nav }) => {
  const msgsRef = collection(firestore, 'msgs')
  const q = query(msgsRef, orderBy('createdAt'), limit(25))

  const [msgs] = useCollectionData(q, { idField: 'id' })
  const [input, setInput] = useState('')

  const sendMsg = async (e) => {
    e.preventDefault()
    const { uid, photoURL } = auth.currentUser

    await addDoc(msgsRef, {
      text: input,
      createdAt: serverTimestamp(),
      uid,
      photo: photoURL
    })

    setInput('')
  }

  return (
    <div className="container-fluid vh-100 d-flex flex-column bg-dark text-white">
      <header className="py-3 bg-dark text-white">
        <div className="container d-flex justify-content-between align-items-center">
          <h1 className="h3 mb-0">Chat</h1>
          <SignOut />
        </div>
      </header>
      <main className="flex-grow-1 d-flex flex-column bg-secondary bg-opacity-25 p-4">
        <div className="w-100 h-100 d-flex flex-column">
          <div className="flex-grow-1 overflow-auto p-3">
            {msgs && msgs.map(msg => <Msg key={msg.id} msg={msg} />)}
          </div>
          <form className="d-flex p-3 bg-dark bg-opacity-50" onSubmit={sendMsg}>
            <input
              className="form-control me-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="text"
              placeholder="Type..."
            />
            <button className="btn btn-primary" type="submit">Send</button>
          </form>
        </div>
      </main>
      <button className="btn btn-outline-light m-3" onClick={() => nav('home')}>Home</button>
    </div>
  )
}

const Msg = ({ msg }) => {
  const { text, uid, photo } = msg
  const msgClass = uid === auth.currentUser?.uid ? 'sent' : 'received'

  return (
    <div className={`d-flex align-items-center mb-3 ${msgClass === 'sent' ? 'justify-content-end' : 'justify-content-start'}`}>
      {msgClass === 'received' && (
        <img src={photo} alt="User" className="rounded-circle me-2" style={{ width: '40px', height: '40px' }} />
      )}
      <div className={`p-3 rounded ${msgClass === 'sent' ? 'bg-primary text-white' : 'bg-light text-dark'}`}>
        <p className="mb-0">{text}</p>
      </div>
    </div>
  )
}

const SignOut = () => (
  <button className="btn btn-outline-light" onClick={() => signOut(auth)}>
    <i className="bi bi-box-arrow-right me-2"></i>Sign Out
  </button>
)

const App = () => {
  const [user] = useAuthState(auth)
  const [page, setPage] = useState('home')

  const nav = (p) => setPage(p)

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Home nav={nav} />
      case 'signup':
        return <SignUp nav={nav} />
      case 'chat':
        return user ? <Chat nav={nav} /> : <SignUp nav={nav} />
      default:
        return <Home nav={nav} />
    }
  }

  return (
    <div className="container-fluid vh-100 d-flex flex-column bg-dark text-white">
      <nav className="navbar navbar-dark bg-dark">
        <div className="container d-flex justify-content-between align-items-center">
          <h1 className="h3 mb-0">Chatify</h1>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-light" onClick={() => nav('home')}>Home</button>
            <button className="btn btn-outline-light" onClick={() => nav('signup')}>Sign Up/Sign In</button>
            <button className="btn btn-outline-light" onClick={() => nav('chat')}>Chat</button>
          </div>
        </div>
      </nav>
      {renderPage()}
    </div>
  )
}

export default App
