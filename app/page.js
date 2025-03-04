'use client'
import React, { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import styles from './page.module.css'

export default function Home() {
  const [flashcards, setFlashcards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [doneCards, setDoneCards] = useState(new Set())
  const [jsConfettiInstance, setJsConfettiInstance] = useState(null)

  // Dynamically import js-confetti on the client
  useEffect(() => {
    import('js-confetti').then(module => {
      const JSConfetti = module.default
      setJsConfettiInstance(new JSConfetti())
    })
  }, [])

  // Handle file drop or selection
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result)
        if (Array.isArray(json)) {
          setFlashcards(json)
        } else {
          setFlashcards([json])
        }
      } catch (error) {
        console.error('Invalid JSON file', error)
      }
    }
    reader.readAsText(file)
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: '.json'
  })

  // If no flashcards loaded, show upload page
  if (flashcards.length === 0) {
    return (
      <div className={styles.page}>
        <h1>Upload Your Flashcard Data</h1>
        <p>(JSON format: question_number, question, answer, explanation)</p>
        <div className={styles.uploadContainer}>
          <div className={styles.uploadSection}>
            <div className={styles.dropzoneContainer} {...getRootProps()}>
              <input {...getInputProps()} />
              <div className={styles.dropzoneMessage}>
                <div className={styles.uploadIcon}>⬆️</div>
                <div className={styles.dropzoneText}>
                  <p>Drag and drop files here</p>
                  <p style={{ color: 'grey' }}>Limit 200MB per file</p>
                </div>
              </div>
              <button className={styles.browseButton}>Browse files</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentCard = flashcards[currentIndex]

  const handleFlip = () => {
    setFlipped(!flipped)
  }

  const handleNext = () => {
    setFlipped(false)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length)
  }

  const handlePrevious = () => {
    setFlipped(false)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length)
  }

  const handleRandom = () => {
    // Filter out indices that are marked as done
    const availableIndices = flashcards.map((_, i) => i).filter(i => !doneCards.has(i))
    if (availableIndices.length === 0) {
      alert("All flashcards are marked as understood!")
      return
    }
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
    setFlipped(false)
    setCurrentIndex(randomIndex)
  }

  const handleUnderstand = (e) => {
    e.stopPropagation()
    setDoneCards((prev) => {
      const newSet = new Set(prev)
      newSet.add(currentIndex)
      // If all flashcards are done and the jsConfettiInstance is ready, trigger confetti
      if (newSet.size === flashcards.length && jsConfettiInstance) {
        jsConfettiInstance.addConfetti({
          emojis: ['💯', '🎉', '💣', '🎊'],
          emojiSize: 70,
          confettiNumber: 50,
        })
      }
      return newSet
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.mainContainer}>
        {/* Flashcard Content */}
        <div className={styles.flashcardContent}>
          <div className={styles.flashcardContainer}>
            <button className={styles.leftArrow} onClick={handlePrevious}>←</button>
            <div 
              className={`${styles.flipCard} ${flipped ? styles.flip : ''}`}
              onClick={handleFlip}
            >
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <div className={styles.cardHeader}>
                    <span className={styles.questionNumber}>{currentCard.question_number}</span>
                  </div>
                  <div className={styles.cardContent}>
                    <p className={styles.questionText}>{currentCard.question}</p>
                  </div>
                </div>
                <div className={styles.flipCardBack}>
                  <div className={styles.cardHeader}>
                    <span className={styles.questionNumber}>{currentCard.question_number}</span>
                  </div>
                  <div className={styles.cardContent}>
                    <p className={styles.answerText}>Answer: {currentCard.answer}</p>
                    <p className={styles.explanationText}>
                      <strong>Explanation:</strong> {currentCard.explanation}
                    </p>
                    
                  </div>
                </div>
              </div>
            </div>
            <button className={styles.rightArrow} onClick={handleNext}>→</button>
          </div>
          <button className={styles.understandButton} onClick={handleUnderstand}>
            I understand
          </button>
          <button className={styles.randomButton} onClick={handleRandom}>Random</button>
        </div>
        {/* Vertical progress bar */}
        <div className={styles.verticalBar}>
          {flashcards.map((card, index) => (
            <div 
              key={index} 
              className={`${styles.verticalBarSegment} ${(index === currentIndex || doneCards.has(index)) ? styles.activeSegment : ''}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}
