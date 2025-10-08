import { useEffect, useState } from 'react'
import { fetchMappings } from '../lib/api'
import type { FieldMapping, Page } from '../lib/api'


export default function MappingsTable() {
    const [data, setData] = useState<Page | null>(null)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [search, setSearch] = useState<string | undefined>(undefined)
    const [sourcetype, setSourcetype] = useState<string | undefined>(undefined)
    const [mapped, setMapped] = useState<boolean | null>(null)


    async function load() {
        const res = await fetchMappings({ page, page_size: pageSize, search, sourcetype, mapped })
        setData(res)
    }


    useEffect(() => { load() }, [page, pageSize, search, sourcetype, mapped])


    return (
        <div className="space-y-3">
            <div className="flex gap-2 items-center">
                <input className="border rounded-lg px-3 py-2" placeholder="Search..." onChange={(e)=>setSearch(e.target.value || undefined)} />
                <input className="border rounded-lg px-3 py-2" placeholder="Sourcetype..." onChange={(e)=>setSourcetype(e.target.value || undefined)} />
                <select className="border rounded-lg px-3 py-2" onChange={(e)=>{
                    const v = e.target.value
                    setMapped(v==='all'? null : v==='true')
                }}>
                    <option value="all">All</option>
                    <option value="true">Mapped</option>
                    <option value="false">Unmapped</option>
                </select>
            </div>


            <div className="overflow-x-auto border rounded-2xl">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Source Field</th>
                        <th className="text-left p-3">ECS Field</th>
                        <th className="text-left p-3">Sourcetype</th>
                        <th className="text-left p-3">Mapped</th>
                        <th className="text-left p-3">Sample Data</th>
                    </tr>
                    </thead>
                    <tbody>
                    {(data?.items ?? []).map((r: FieldMapping) => (
                        <tr key={r.id} className="border-t">
                            <td className="p-3">{r.id}</td>
                            <td className="p-3 font-mono">{r.source_field}</td>
                            <td className="p-3 font-mono">{r.ecs_field}</td>
                            <td className="p-3">{r.sourcetype}</td>
                            <td className="p-3">{r.mapped_to_ecs? 'Yes' : 'No'}</td>
                            <td className="p-3 max-w-xl truncate" title={r.sample_data}>{r.sample_data}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>


            <div className="flex items-center gap-2">
                <button className="px-3 py-2 border rounded-lg" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</button>
                <span>Page {data?.meta.page ?? page} / {data? Math.ceil(data.meta.total / data.meta.page_size) : 1}</span>
                <button className="px-3 py-2 border rounded-lg" disabled={!!data && (data.meta.page * data.meta.page_size >= data.meta.total)} onClick={()=>setPage(p=>p+1)}>Next</button>
                <select className="border rounded-lg px-2 py-1 ml-2" value={pageSize} onChange={(e)=>setPageSize(parseInt(e.target.value))}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
        </div>
    )
}