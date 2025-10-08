import './App.css'
import MappingsTable from './components/MappingsTable'

function App() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-4">
            <h1 className="text-2xl font-semibold">Field Mappings</h1>
            <p className="text-gray-600">Reading from <code>field_mappings_one</code> via FastAPI.</p>
            <MappingsTable />
        </div>
    )
}

export default App
