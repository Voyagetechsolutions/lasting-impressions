// Helper functions to convert SQL queries to Supabase
export async function selectAll(supabase, table, orderBy = 'created_at', ascending = false) {
    const { data, error } = await supabase
        .from(table)
        .select('*')
        .order(orderBy, { ascending });
    if (error) throw error;
    return data;
}

export async function selectWhere(supabase, table, column, value) {
    const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(column, value);
    if (error) throw error;
    return data;
}

export async function selectOne(supabase, table, column, value) {
    const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(column, value)
        .single();
    if (error) throw error;
    return data;
}

export async function insert(supabase, table, values) {
    const { data, error } = await supabase
        .from(table)
        .insert(values)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function update(supabase, table, id, values) {
    const { data, error } = await supabase
        .from(table)
        .update(values)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteRow(supabase, table, id) {
    const { data, error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}
