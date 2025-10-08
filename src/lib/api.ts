import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export interface PagingMeta {
    page: number;
    page_size: number;
    total: number
}

export interface FieldMapping{
    id: number
    source_field?: string
    ecs_field?: string
    sample_data?: string
    mapped_to_ecs: boolean
    sourcetype?: string
}

export interface Page {
    items: FieldMapping[];
    meta: PagingMeta
}

export async function fetchMappings(params:{
    page?: number
    page_size?: number
    search?: string
    sourcetype?: string
    mapped?: boolean | null
}={}): Promise<Page>{
    const res = await axios.get(`${API_BASE}/mappings`, { params })
    return res.data
}