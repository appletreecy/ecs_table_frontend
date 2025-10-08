import { useEffect, useMemo, useState } from 'react'
import { fetchMappings } from '../lib/api'
import type { FieldMapping, Page } from '../lib/api'

export default function MappingsTable() {
    const [data, setData] = useState<Page | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    // Controls / filters
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [search, setSearch] = useState<string | undefined>(undefined)
    const [sourcetype, setSourcetype] = useState<string | undefined>(undefined)
    const [mapped, setMapped] = useState<boolean | null>(null) // null=All, true/false filters
    const [humanVerified, setHumanVerified] = useState<boolean | null>(null)

    // Derived, safely guarded
    const items = useMemo(() => data?.items ?? [], [data])
    const meta = data?.meta
    const currentPage = meta?.page ?? page
    const currentPageSize = meta?.page_size ?? pageSize
    const total = meta?.total ?? 0
    const totalPages = total > 0 ? Math.ceil(total / currentPageSize) : 1
    const canPrev = currentPage > 1
    const canNext = meta ? meta.page * meta.page_size < meta.total : false

    const ROW_H = 44;
    const HEAD_H = 48;
    const tableHeight = HEAD_H + ROW_H*pageSize;

    async function load() {
        try {
            setLoading(true)
            setError(null)
            const res = await fetchMappings({
                page,
                page_size: pageSize,
                search,
                sourcetype,
                mapped,
                human_verified: humanVerified,
            })
            setData(res)
        } catch (e: any) {
            setError(e?.message ?? 'Failed to load mappings')
            setData(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // fire on initial mount + whenever filters/pagination change
        load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, search, sourcetype, mapped, humanVerified])

    return (
        <div className="space-y-3">
            {/* Filters */}
            <div className="flex gap-2 items-center">
                <input
                    className="border rounded-lg px-3 py-2"
                    placeholder="Search..."
                    value={search ?? ''}
                    onChange={(e) => setSearch(e.target.value || undefined)}
                />
                <input
                    className="border rounded-lg px-3 py-2"
                    placeholder="Sourcetype..."
                    value={sourcetype ?? ''}
                    onChange={(e) => setSourcetype(e.target.value || undefined)}
                />
                <select
                    className="border rounded-lg px-3 py-2"
                    value={mapped === null ? 'all' : String(mapped)}
                    onChange={(e) => {
                        const v = e.target.value
                        setMapped(v === 'all' ? null : v === 'true')
                        // reset to first page when filter changes
                        setPage(1)
                    }}
                >
                    <option value="all">All</option>
                    <option value="true">Mapped</option>
                    <option value="false">Unmapped</option>
                </select>

                <button
                    className="ml-2 px-3 py-2 border rounded-lg"
                    onClick={() => {
                        setSearch(undefined)
                        setSourcetype(undefined)
                        setMapped(null)
                        setHumanVerified(null)
                        setPage(1)
                    }}
                >
                    Reset
                </button>
            </div>

            {/* Loading / Error */}
            {loading && (
                <div className="p-3 text-sm text-gray-700">Loading…</div>
            )}
            {error && (
                <div className="p-3 text-sm text-red-600">Error: {error}</div>
            )}

            {/* Table */}
            {/*{!loading && !error && (*/}
            {/*    <div className="overflow-x-auto border rounded-2xl">*/}
            {/*        <table className="min-w-full text-sm">*/}
            {/*            <thead className="bg-gray-50">*/}
            {/*            <tr>*/}
            {/*                <th className="text-left p-3">ID</th>*/}
            {/*                <th className="text-left p-3">Source Field</th>*/}
            {/*                <th className="text-left p-3">ECS Field</th>*/}
            {/*                <th className="text-left p-3">Sourcetype</th>*/}
            {/*                <th className="text-left p-3">Mapped</th>*/}
            {/*                <th className="text-left p-3">Human Verified</th>*/}
            {/*                <th className="text-left p-3">Sample Data</th>*/}
            {/*            </tr>*/}
            {/*            </thead>*/}
            {/*            <tbody>*/}
            {/*            {items.map((r: FieldMapping) => (*/}
            {/*                <tr key={r.id} className="border-t">*/}
            {/*                    <td className="p-3">{r.id}</td>*/}
            {/*                    <td className="p-3 font-mono">{r.source_field}</td>*/}
            {/*                    <td className="p-3 font-mono">{r.ecs_field}</td>*/}
            {/*                    <td className="p-3">{r.sourcetype}</td>*/}
            {/*                    <td className="p-3">{r.mapped_to_ecs ? 'Yes' : 'No'}</td>*/}
            {/*                    <td className="p-3">{r.human_verified ? 'Yes' : 'No'}</td>*/}
            {/*                    <td*/}
            {/*                        className="p-3 max-w-xl truncate"*/}
            {/*                        title={r.sample_data}*/}
            {/*                    >*/}
            {/*                        {r.sample_data}*/}
            {/*                    </td>*/}
            {/*                </tr>*/}
            {/*            ))}*/}
            {/*            {items.length === 0 && (*/}
            {/*                <tr>*/}
            {/*                    <td className="p-3 text-gray-500" colSpan={6}>*/}
            {/*                        No data*/}
            {/*                    </td>*/}
            {/*                </tr>*/}
            {/*            )}*/}
            {/*            </tbody>*/}
            {/*        </table>*/}
            {/*    </div>*/}
            {/*)}*/}

            {/* TABLE */}
            {!loading && !error && (
                <div className="border rounded-2xl overflow-hidden">
                    <div className="overflow-y-auto" style={{ height: tableHeight }}>
                        <table className="min-w-full table-fixed text-sm">
                            {/* 1) Fix column widths so columns don't shift */}
                            <colgroup>
                                <col style={{ width: 72 }} />     {/* ID */}
                                <col style={{ width: 240 }} />    {/* Source Field */}
                                <col style={{ width: 240 }} />    {/* ECS Field */}
                                <col style={{ width: 160 }} />    {/* Sourcetype */}
                                <col style={{ width: 120 }} />    {/* Mapped */}
                                <col style={{ width: 140 }} />    {/* Human Verified */}
                                <col />                           {/* Sample Data (flex/grows) */}
                            </colgroup>

                            {/* 2) Sticky header so it stays in place while rows scroll */}
                            <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="text-left p-3">ID</th>
                                <th className="text-left p-3">Source Field</th>
                                <th className="text-left p-3">ECS Field</th>
                                <th className="text-left p-3">Sourcetype</th>
                                <th className="text-left p-3">Mapped</th>
                                <th className="text-left p-3">Human Verified</th>
                                <th className="text-left p-3">Sample Data</th>
                            </tr>
                            </thead>

                            <tbody>
                            {/* 3) Real rows: fixed row height + truncate long text */}
                            {items.map((r: FieldMapping) => (
                                <tr key={r.id} className="border-t" style={{ height: ROW_H }}>
                                    <td className="p-3">{r.id}</td>
                                    <td className="p-3 font-mono truncate" title={r.source_field}>{r.source_field}</td>
                                    <td className="p-3 font-mono truncate" title={r.ecs_field}>{r.ecs_field}</td>
                                    <td className="p-3 truncate" title={r.sourcetype}>{r.sourcetype}</td>
                                    <td className="p-3 whitespace-nowrap">{r.mapped_to_ecs ? 'Yes' : 'No'}</td>
                                    <td className="p-3 whitespace-nowrap">{r.human_verified ? 'Yes' : 'No'}</td>
                                    <td className="p-3 truncate max-w-xl" title={r.sample_data}>{r.sample_data}</td>
                                </tr>
                            ))}

                            {/* 4) Padding rows: keep body height constant on short pages */}
                            {Array.from({ length: Math.max(0, pageSize - items.length) }).map((_, i) => (
                                <tr key={`pad-${i}`} className="border-t" style={{ height: ROW_H }}>
                                    <td colSpan={7} />
                                </tr>
                            ))}

                            {/* (optional) no-data message – still keeps height via padding rows above */}
                            {items.length === 0 && (
                                <tr>
                                    <td className="p-3 text-gray-500" colSpan={7}>No data</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


            {/* Pagination */}
            <div className="flex items-center gap-2">
                <button
                    className="px-3 py-2 border rounded-lg"
                    disabled={!canPrev || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                    Prev
                </button>

                <span>
          Page {currentPage} / {totalPages}
        </span>

                <button
                    className="px-3 py-2 border rounded-lg"
                    disabled={!canNext || loading}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Next
                </button>

                <select
                    className="border rounded-lg px-2 py-1 ml-2"
                    value={pageSize}
                    onChange={(e) => {
                        const newSize = parseInt(e.target.value, 10)
                        setPageSize(newSize)
                        setPage(1) // reset to first page when page size changes
                    }}
                    disabled={loading}
                >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>

                {/* Small status hint */}
                {!!total && (
                    <span className="ml-2 text-xs text-gray-500">
            {items.length} shown of {total}
          </span>
                )}
            </div>
        </div>
    )
}
