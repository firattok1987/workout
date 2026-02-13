"use client"

import { useState, useEffect } from "react"
import * as XLSX from "xlsx"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"

type Entry = {
  week: number
  exercise: string
  weight: number
  reps: number
  rir: number
  e1rm: number
}

export default function AdaptiveTrainingEngine() {
  const [week, setWeek] = useState(1)
  const [exercise, setExercise] = useState("")
  const [weight, setWeight] = useState(0)
  const [reps, setReps] = useState(0)
  const [rir, setRir] = useState(0)
  const [entries, setEntries] = useState<Entry[]>([])
  const [suggestion, setSuggestion] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("training_data")
    if (saved) setEntries(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem("training_data", JSON.stringify(entries))
  }, [entries])

  function calculateE1RM(weight: number, reps: number) {
    return weight * (1 + reps / 30)
  }

  function optimizeNextSession(current: Entry) {
    const weekMod = current.week % 4

    if (weekMod === 0) {
      return `Deload → ${Math.round(current.weight * 0.9)} kg x ${current.reps - 2}`
    }

    if (current.rir >= 3) {
      return `+2.5kg → ${current.weight + 2.5} kg x ${current.reps}`
    }

    if (current.rir === 2) {
      return `+1.25kg → ${current.weight + 1.25} kg x ${current.reps}`
    }

    if (current.rir <= 1) {
      return `Same weight → ${current.weight} kg try +1 rep`
    }

    return "Maintain"
  }

  function handleSave() {
    if (!exercise) return

    const e1rm = calculateE1RM(weight, reps)
    const newEntry: Entry = {
      week,
      exercise,
      weight,
      reps,
      rir,
      e1rm,
    }

    setEntries([...entries, newEntry])
    setSuggestion(optimizeNextSession(newEntry))
  }

  function exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(entries)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "TrainingData")
    XLSX.writeFile(workbook, "training_data.xlsx")
  }

  function importExcel(e: any) {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (evt: any) => {
      const data = new Uint8Array(evt.target.result)
      const workbook = XLSX.read(data, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      setEntries(jsonData as Entry[])
    }
    reader.readAsArrayBuffer(file)
  }

  const filteredData = entries.filter((e) => e.exercise === exercise)

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-8">
        Adaptive Training Engine
      </h1>

      <div className="grid grid-cols-6 gap-4 mb-6">
        <input type="number" value={week} onChange={(e)=>setWeek(Number(e.target.value))} placeholder="Hafta" className="bg-gray-800 p-2 rounded"/>
        <input value={exercise} onChange={(e)=>setExercise(e.target.value)} placeholder="Hareket" className="bg-gray-800 p-2 rounded"/>
        <input type="number" value={weight} onChange={(e)=>setWeight(Number(e.target.value))} placeholder="Kg" className="bg-gray-800 p-2 rounded"/>
        <input type="number" value={reps} onChange={(e)=>setReps(Number(e.target.value))} placeholder="Tekrar" className="bg-gray-800 p-2 rounded"/>
        <input type="number" value={rir} onChange={(e)=>setRir(Number(e.target.value))} placeholder="RIR" className="bg-gray-800 p-2 rounded"/>

        <button onClick={handleSave} className="bg-green-600 rounded p-2">
          Kaydet
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={exportExcel} className="bg-blue-600 px-4 py-2 rounded">
          Excel Export
        </button>

        <label className="bg-purple-600 px-4 py-2 rounded cursor-pointer">
          Excel Import
          <input type="file" accept=".xlsx" onChange={importExcel} hidden/>
        </label>
      </div>

      {suggestion && (
        <div className="bg-gray-900 p-4 rounded mb-6">
          <h2 className="text-xl font-semibold">Optimizasyon Önerisi</h2>
          <p>{suggestion}</p>
        </div>
      )}

      <div className="bg-gray-900 p-6 rounded">
        <h2 className="text-xl mb-4">Performans Trend (e1RM)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData}>
            <CartesianGrid stroke="#333"/>
            <XAxis dataKey="week"/>
            <YAxis/>
            <Tooltip/>
            <Line type="monotone" dataKey="e1rm" stroke="#00ff88" strokeWidth={2}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

