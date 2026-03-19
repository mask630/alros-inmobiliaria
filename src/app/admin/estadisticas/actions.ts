'use server';

import { createClient } from "@/utils/supabase/server";

export async function getAdvancedStats() {
    const supabase = await createClient();

    // 1. Fetch properties and leads
    const { data: properties } = await supabase
        .from('properties')
        .select('created_at, operation_type, property_type, status, created_by');

    const { data: leads } = await supabase
        .from('interesados')
        .select('created_at, created_by, origen');

    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role');

    if (!properties || !leads || !profiles) {
        return { error: "No se pudieron obtener los datos" };
    }

    // 2. Process Monthly Evolution & Trends
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const propsThisMonth = properties.filter(p => {
        const d = new Date(p.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const propsLastMonth = properties.filter(p => {
        const d = new Date(p.created_at);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    }).length;

    const leadsThisMonth = leads.filter(l => {
        const d = new Date(l.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const leadsLastMonth = leads.filter(l => {
        const d = new Date(l.created_at);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    }).length;

    // Calculate trends (safely)
    const calculateTrend = (current: number, last: number) => {
        if (last === 0) return current > 0 ? "+100%" : "0%";
        const diff = ((current - last) / last) * 100;
        return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
    };

    const propsTrend = calculateTrend(propsThisMonth, propsLastMonth);
    const leadsTrend = calculateTrend(leadsThisMonth, leadsLastMonth);

    // Evolution (Last 6 Months)
    const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d.toLocaleString('es-ES', { month: 'short' });
    }).reverse();

    const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    
    const monthlyEvolution = last6Months.map(monthLabel => {
        const countProps = properties.filter(p => {
            const d = new Date(p.created_at);
            return monthNames[d.getMonth()] === monthLabel.toLowerCase();
        }).length;

        const countLeads = leads.filter(l => {
            const d = new Date(l.created_at);
            return monthNames[d.getMonth()] === monthLabel.toLowerCase();
        }).length;

        return { month: monthLabel, propiedades: countProps, interesados: countLeads };
    });

    // 3. Property & Lead Distributions
    const typeDistribution = properties.reduce((acc: any, p) => {
        const type = p.property_type || 'Otros';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const typeData = Object.entries(typeDistribution).map(([name, value]) => ({ name, value }));

    const originDistribution = leads.reduce((acc: any, l) => {
        const origin = l.origen || 'manual';
        acc[origin] = (acc[origin] || 0) + 1;
        return acc;
    }, {});

    const originLabels: Record<string, string> = {
        chatbot: 'Chatbot IA',
        web_propiedad: 'Propiedad',
        web_tasacion: 'Tasación',
        web_contacto: 'Contacto Web',
        manual: 'Manual'
    };

    const originData = Object.entries(originDistribution).map(([name, value]) => ({ 
        name: originLabels[name] || name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '), 
        value 
    }));

    // 4. Agent Performance
    const agentPerformance = profiles.map(profile => {
        const propsCreated = properties.filter(p => p.created_by === profile.id).length;
        const leadsCreated = leads.filter(l => l.created_by === profile.id).length;
        
        return {
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Sin Nombre',
            propiedades: propsCreated,
            leads: leadsCreated,
            total: propsCreated + leadsCreated
        };
    }).filter(a => a.total > 0).sort((a, b) => b.total - a.total);

    // 5. Status Summary
    const statusCounts = properties.reduce((acc: any, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
    }, {});

    const totalSoldRented = (statusCounts.vendido || 0) + (statusCounts.alquilado || 0);

    // 6. Operations Distribution
    const operationDistribution = properties.reduce((acc: any, p) => {
        const op = p.operation_type?.toLowerCase() === 'venta' ? 'Venta' : 'Alquiler';
        acc[op] = (acc[op] || 0) + 1;
        return acc;
    }, { 'Venta': 0, 'Alquiler': 0 });

    const operationData = Object.entries(operationDistribution).map(([name, value]) => ({ name, value }));

    return {
        evolution: monthlyEvolution,
        types: typeData,
        origins: originData,
        agents: agentPerformance,
        status: statusCounts,
        operations: operationData,
        trends: {
            props: propsTrend,
            leads: leadsTrend,
            totalSold: totalSoldRented
        },
        counts: {
            props: properties.length,
            leads: leads.length
        }
    };
}
