'use client'
import React, { use, useState } from 'react'
import styles from './page.module.css'
import data from '../data/data.json'

export default function Home() {
  const [flashcards, setFlashcards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result)
        if (Array.isArray(json)) {
          setFlashcards(json)
        } else {
          setFlashcards([json])
        }
      } catch (error) {
        console.error("Invalid JSON file", error)
      }
    }
    reader.readAsText(file)
  }

  if (flashcards.length == 0) {
    return (
      <div className={styles.page}>
        <h1>Upload Your Flashcard Data (JSON - question_number, question, answer, explanation)</h1>
        <input type="file" accept=".json" onChange={handleFileUpload} />
      </div>
    )
  }

  const currentCard = flashcards[currentIndex]

  const handleFlip = () => { 
    setFlipped(!flipped)
  }

  const handleNext = () => {
    setFlipped(false)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length)
  }

  const handlePrevious = () => {
    setFlipped(false)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + data.length) % data.length)
  }

  return (
    <div className={styles.page}>
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
    </div>
  )
}