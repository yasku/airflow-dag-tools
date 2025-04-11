"""
Página de dashboard para visualización de datos.

Esta página muestra KPIs, gráficos interactivos y tablas filtrables
basados en los datos CSV cargados.
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import io
from utils.visualization import generate_summary_stats, create_distribution_chart, create_correlation_heatmap

# Aplicar estilo CSS personalizado
st.markdown("""
<style>
    .kpi-card {
        background-color: #f8f9fa;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
        transition: transform 0.3s ease;
    }
    .kpi-card:hover {
        transform: translateY(-5px);
    }
    .kpi-title {
        font-size: 16px;
        color: #555;
        margin-bottom: 10px;
    }
    .kpi-value {
        font-size: 28px;
        font-weight: bold;
        color: #1E88E5;
    }
    .dashboard-title {
        text-align: center;
        margin-bottom: 30px;
        color: #333;
    }
    .chart-container {
        background-color: white;
        border-radius: 10px;
        padding: 15px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
    }
    .chart-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 15px;
        color: #333;
    }
    .filter-section {
        background-color: #f0f2f6;
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 20px;
    }
</style>
""", unsafe_allow_html=True)

# Título de la página con diseño mejorado
st.markdown("<h1 class='dashboard-title'>📊 Dashboard de Análisis</h1>", unsafe_allow_html=True)

# Verificar si hay datos cargados
if not st.session_state.get('has_data', False):
    st.warning("⚠️ No hay datos cargados. Por favor, dirígete a la página 'Subir Archivo' para cargar datos.")
    
    # Mostrar tarjeta de ayuda
    st.markdown("""
    <div style="background-color: #e8f4f8; padding: 20px; border-radius: 10px; border-left: 5px solid #4CAF50;">
        <h3 style="color: #2E7D32;">📝 Cómo empezar</h3>
        <p>Para utilizar el dashboard, primero necesitas cargar datos CSV:</p>
        <ol>
            <li>Navega a la página <b>"Subir Archivo"</b> en el menú lateral</li>
            <li>Selecciona uno o más archivos CSV para cargar</li>
            <li>Revisa la previsualización y confirma la carga</li>
            <li>Regresa a esta página para comenzar el análisis</li>
        </ol>
    </div>
    """, unsafe_allow_html=True)
    st.stop()

# Selector de archivo activo con estilo mejorado
st.markdown("<div class='filter-section'>", unsafe_allow_html=True)
active_files = list(st.session_state.get('dataframes', {}).keys())
selected_file = st.selectbox(
    "📄 Selecciona un archivo para analizar",
    active_files,
    index=active_files.index(st.session_state.get('active_file', active_files[0])) if active_files else 0
)
st.markdown("</div>", unsafe_allow_html=True)

# Actualizar archivo activo
st.session_state['active_file'] = selected_file
df = st.session_state['dataframes'][selected_file]

# KPIs principales con tarjetas mejoradas
st.markdown("<h2 style='margin-top: 20px;'>📈 Indicadores Clave</h2>", unsafe_allow_html=True)

# Generar estadísticas de resumen
summary_stats = generate_summary_stats(df)

# Crear KPIs con iconos y tarjetas
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-title">📋 Total de registros</div>
        <div class="kpi-value">{summary_stats['total_rows']}</div>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-title">✅ Campos completos</div>
        <div class="kpi-value">{summary_stats['completeness_pct']}%</div>
    </div>
    """, unsafe_allow_html=True)

with col3:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-title">🔢 Campos numéricos</div>
        <div class="kpi-value">{summary_stats['numeric_columns']}</div>
    </div>
    """, unsafe_allow_html=True)

with col4:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-title">🏷️ Campos categóricos</div>
        <div class="kpi-value">{summary_stats['categorical_columns']}</div>
    </div>
    """, unsafe_allow_html=True)

# Sección de gráficos con contenedor mejorado
st.markdown("<h2 style='margin-top: 40px;'>📊 Visualización de Datos</h2>", unsafe_allow_html=True)

# Pestañas para diferentes tipos de gráficos
chart_tabs = st.tabs(["📊 Distribución", "🔄 Correlación", "📊 Gráfico de barras", "📈 Gráfico de dispersión"])

with chart_tabs[0]:
    # Distribución de datos
    st.markdown("<div class='chart-container'>", unsafe_allow_html=True)
    st.markdown("<div class='chart-title'>📊 Distribución de datos</div>", unsafe_allow_html=True)
    
    if df.select_dtypes(include=['number']).columns.tolist():
        column = st.selectbox("Selecciona columna para visualizar distribución", 
                          df.select_dtypes(include=['number']).columns.tolist(),
                          key="dist_column")
        
        # Crear gráfico de distribución
        fig = create_distribution_chart(df, column)
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("⚠️ No hay columnas numéricas disponibles para mostrar distribución.")
    
    st.markdown("</div>", unsafe_allow_html=True)

with chart_tabs[1]:
    # Correlación entre variables
    st.markdown("<div class='chart-container'>", unsafe_allow_html=True)
    st.markdown("<div class='chart-title'>🔄 Matriz de Correlación</div>", unsafe_allow_html=True)
    
    # Verificar si hay suficientes columnas numéricas
    num_cols = df.select_dtypes(include=['number']).columns.tolist()
    if len(num_cols) > 1:
        fig = create_correlation_heatmap(df)
        st.plotly_chart(fig, use_container_width=True)
        
        # Mostrar las correlaciones más fuertes
        st.markdown("#### 🔗 Correlaciones más fuertes:")
        corr_matrix = df[num_cols].corr().abs()
        
        # Obtener las correlaciones más fuertes (excluyendo la diagonal)
        corr_pairs = []
        for i in range(len(num_cols)):
            for j in range(i+1, len(num_cols)):
                corr_pairs.append((num_cols[i], num_cols[j], corr_matrix.iloc[i, j]))
        
        # Ordenar por valor de correlación
        corr_pairs.sort(key=lambda x: x[2], reverse=True)
        
        # Mostrar las 5 correlaciones más fuertes
        for i, (col1, col2, corr) in enumerate(corr_pairs[:5]):
            st.markdown(f"**{i+1}.** **{col1}** y **{col2}**: {corr:.3f}")
            
    else:
        st.info("⚠️ Se necesitan al menos 2 columnas numéricas para mostrar correlaciones.")
    
    st.markdown("</div>", unsafe_allow_html=True)

with chart_tabs[2]:
    # Gráfico de barras
    st.markdown("<div class='chart-container'>", unsafe_allow_html=True)
    st.markdown("<div class='chart-title'>📊 Gráfico de Barras</div>", unsafe_allow_html=True)
    
    # Configuración para gráfico de barras
    col1, col2 = st.columns(2)
    with col1:
        x_axis = st.selectbox("Selecciona eje X (categoría)", df.columns.tolist(), key="bar_x")
    with col2:
        # Solo permitir columnas numéricas para el eje Y
        numeric_columns = df.select_dtypes(include=['number']).columns.tolist()
        if numeric_columns:
            y_axis = st.selectbox("Selecciona eje Y (valor)", numeric_columns, key="bar_y")
            
            # Opciones de agregación con íconos
            agg_options = {
                "sum": "🧮 Suma",
                "mean": "📏 Promedio",
                "count": "🔢 Conteo",
                "min": "⬇️ Mínimo",
                "max": "⬆️ Máximo"
            }
            agg_method = st.selectbox(
                "Método de agregación", 
                list(agg_options.keys()),
                format_func=lambda x: agg_options[x],
                key="bar_agg"
            )
            
            # Crear gráfico de barras con colores personalizados
            fig = px.bar(
                df.groupby(x_axis)[y_axis].agg(agg_method).reset_index(),
                x=x_axis,
                y=y_axis,
                title=f"{agg_options[agg_method].split(' ')[1]} de {y_axis} por {x_axis}",
                color_discrete_sequence=px.colors.qualitative.G10,
                labels={
                    x_axis: x_axis.capitalize(),
                    y_axis: y_axis.capitalize()
                }
            )
            
            # Personalizar diseño
            fig.update_layout(
                plot_bgcolor='rgba(0,0,0,0)',
                xaxis=dict(showgrid=False),
                yaxis=dict(showgrid=True, gridcolor='rgba(0,0,0,0.1)'),
                hoverlabel=dict(bgcolor="white", font_size=12, font_family="Arial"),
                hovermode="x unified"
            )
            
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("⚠️ No hay columnas numéricas disponibles para el eje Y.")
    
    st.markdown("</div>", unsafe_allow_html=True)

with chart_tabs[3]:
    # Tabla de datos filtrable
    st.markdown("<div class='chart-container'>", unsafe_allow_html=True)
    st.markdown("<div class='chart-title'>📋 Tabla de Datos Avanzada</div>", unsafe_allow_html=True)
    
    # Configuración para filtrado avanzado
    with st.expander("🔍 Opciones de filtrado", expanded=True):
        # Filtrado por columnas
        filter_cols = st.multiselect(
            "Selecciona columnas para el filtrado",
            df.columns.tolist(),
            key="tab4_filter_cols"
        )
        
        # Crear filtros dinámicos por cada columna seleccionada
        filters = {}
        for col in filter_cols:
            if df[col].dtype == 'object' or df[col].nunique() < 10:
                # Para columnas categóricas
                options = ["Todos"] + sorted(df[col].dropna().unique().tolist())
                selected = st.selectbox(
                    f"Filtrar {col}", 
                    options,
                    key=f"tab4_filter_{col}"
                )
                if selected != "Todos":
                    filters[col] = selected
            else:
                # Para columnas numéricas
                min_val = float(df[col].min())
                max_val = float(df[col].max())
                filter_range = st.slider(
                    f"Rango de {col}",
                    min_value=min_val,
                    max_value=max_val,
                    value=(min_val, max_val),
                    key=f"tab4_range_{col}"
                )
                if filter_range != (min_val, max_val):
                    filters[col] = filter_range
        
        # Opciones de ordenación
        col1, col2 = st.columns(2)
        with col1:
            sort_col = st.selectbox(
                "Ordenar por",
                ["Sin ordenar"] + df.columns.tolist(),
                key="tab4_sort_col"
            )
        with col2:
            if sort_col != "Sin ordenar":
                sort_order = st.radio(
                    "Orden",
                    ["Ascendente", "Descendente"],
                    horizontal=True,
                    key="tab4_sort_order"
                )
    
    # Aplicar filtros al dataframe
    filtered_df = df.copy()
    for col, val in filters.items():
        if isinstance(val, tuple):  # Rango numérico
            filtered_df = filtered_df[(filtered_df[col] >= val[0]) & (filtered_df[col] <= val[1])]
        else:  # Valor categórico
            filtered_df = filtered_df[filtered_df[col] == val]
    
    # Aplicar ordenación
    if sort_col != "Sin ordenar":
        filtered_df = filtered_df.sort_values(
            by=sort_col,
            ascending=(sort_order == "Ascendente")
        )
    
    # Mostrar estadísticas de filtrado
    total_rows = len(df)
    filtered_rows = len(filtered_df)
    percentage = round((filtered_rows / total_rows) * 100, 1) if total_rows > 0 else 0
    
    st.markdown(f"""
    <div style="background-color: #e8f4f8; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center;">
        <div style="background-color: #1E88E5; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
            <span style="font-size: 20px;">📊</span>
        </div>
        <div>
            <span style="font-weight: bold; font-size: 16px;">Mostrando {filtered_rows} de {total_rows} filas ({percentage}%)</span>
            <br>
            <span style="color: #555;">Utiliza los filtros para refinar los resultados</span>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Mostrar tabla interactiva con los datos filtrados
    st.dataframe(
        filtered_df,
        use_container_width=True,
        height=400,
        column_config={
            col: st.column_config.Column(
                col, 
                help=f"Tipo: {df[col].dtype}"
            ) for col in filtered_df.columns
        }
    )
    
    # Opciones de exportación
    with st.expander("📥 Exportar datos filtrados"):
        col1, col2, col3 = st.columns(3)
        with col1:
            # Exportar como CSV
            csv_data = filtered_df.to_csv(index=False).encode('utf-8')
            st.download_button(
                label="Descargar como CSV",
                data=csv_data,
                file_name="datos_filtrados.csv",
                mime="text/csv",
                key="tab4_download_csv"
            )
        with col2:
            # Exportar como Excel-compatible (TSV)
            tsv_data = filtered_df.to_csv(index=False, sep='\t').encode('utf-8')
            st.download_button(
                label="Descargar como TSV",
                data=tsv_data,
                file_name="datos_filtrados.tsv",
                mime="text/tab-separated-values",
                key="tab4_download_tsv"
            )
        with col3:
            # Exportar como JSON
            json_data = filtered_df.to_json(orient="records")
            st.download_button(
                label="Descargar como JSON",
                data=json_data,
                file_name="datos_filtrados.json",
                mime="application/json",
                key="tab4_download_json"
            )
    
    # Resumen estadístico de los datos filtrados
    if not filtered_df.empty:
        with st.expander("📊 Estadísticas de los datos filtrados"):
            num_df = filtered_df.select_dtypes(include=['number'])
            if not num_df.empty:
                stats = pd.DataFrame({
                    'Mínimo': num_df.min(),
                    'Máximo': num_df.max(),
                    'Media': num_df.mean(),
                    'Mediana': num_df.median(),
                    'Desv. Est.': num_df.std()
                })
                st.dataframe(stats, use_container_width=True)
            else:
                st.info("No hay columnas numéricas para mostrar estadísticas.")
    
    st.markdown("</div>", unsafe_allow_html=True)

# Tabla filtrable con diseño mejorado
st.markdown("<h2 style='margin-top: 40px;'>🔍 Tabla de Datos</h2>", unsafe_allow_html=True)

# Opciones de filtrado con diseño mejorado
st.markdown("<div class='filter-section'>", unsafe_allow_html=True)
st.markdown("#### ⚙️ Opciones de filtrado")

# Crear filtros dinámicos basados en las columnas
filter_cols = st.multiselect("Selecciona columnas para filtrar", df.columns.tolist(), key="filter_cols")

filters = {}
for col in filter_cols:
    if df[col].dtype == 'object' or df[col].nunique() < 10:
        # Para columnas categóricas o con pocos valores únicos
        unique_values = ["Todos"] + list(df[col].dropna().unique())
        selected = st.selectbox(f"Filtrar por {col}", unique_values, key=f"filter_{col}")
        if selected != "Todos":
            filters[col] = selected
    else:
        # Para columnas numéricas
        min_val = float(df[col].min())
        max_val = float(df[col].max())
        range_val = st.slider(f"Rango de {col}", min_val, max_val, (min_val, max_val), key=f"range_{col}")
        if range_val != (min_val, max_val):
            filters[col] = range_val

st.markdown("</div>", unsafe_allow_html=True)

# Aplicar filtros
filtered_df = df.copy()
for col, val in filters.items():
    if isinstance(val, tuple):  # Rango numérico
        filtered_df = filtered_df[(filtered_df[col] >= val[0]) & (filtered_df[col] <= val[1])]
    else:  # Valor exacto
        filtered_df = filtered_df[filtered_df[col] == val]

# Mostrar número de filas después del filtrado con badge
st.markdown(f"""
<div style="background-color: #e6f7ff; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
    <span style="background-color: #1E88E5; color: white; padding: 5px 10px; border-radius: 20px; font-size: 14px; margin-right: 10px;">
        {len(filtered_df)}
    </span>
    de {len(df)} registros encontrados
</div>
""", unsafe_allow_html=True)

# Mostrar tabla con datos filtrados
st.dataframe(filtered_df, use_container_width=True)

# Resumen estadístico de los datos filtrados con diseño mejorado
with st.expander("📊 Resumen estadístico de datos filtrados"):
    if not filtered_df.empty:
        # Pestañas para estadísticas
        stat_tabs = st.tabs(["📊 Estadísticas generales", "📈 Numéricos", "📋 No numéricos"])
        
        with stat_tabs[0]:
            st.dataframe(filtered_df.describe(include='all'), use_container_width=True)
        
        with stat_tabs[1]:
            num_df = filtered_df.select_dtypes(include=['number'])
            if not num_df.empty:
                # Mostrar estadísticas más detalladas para numéricos
                stats_df = pd.DataFrame({
                    'Media': num_df.mean(),
                    'Mediana': num_df.median(),
                    'Desv. Est.': num_df.std(),
                    'Mínimo': num_df.min(),
                    'Máximo': num_df.max(),
                    'Rango': num_df.max() - num_df.min(),
                    'Valores nulos': num_df.isna().sum()
                })
                st.dataframe(stats_df, use_container_width=True)
            else:
                st.info("No hay columnas numéricas disponibles")
        
        with stat_tabs[2]:
            cat_df = filtered_df.select_dtypes(exclude=['number'])
            if not cat_df.empty:
                # Mostrar estadísticas para categóricos
                cat_stats = pd.DataFrame({
                    'Tipo': cat_df.dtypes,
                    'Valores únicos': cat_df.nunique(),
                    'Valor más frecuente': [cat_df[col].value_counts().index[0] if not cat_df[col].value_counts().empty else None for col in cat_df.columns],
                    'Frecuencia del valor más común': [cat_df[col].value_counts().iloc[0] if not cat_df[col].value_counts().empty else 0 for col in cat_df.columns],
                    'Valores nulos': cat_df.isna().sum()
                })
                st.dataframe(cat_stats, use_container_width=True)
            else:
                st.info("No hay columnas categóricas disponibles")
    else:
        st.info("No hay datos disponibles con los filtros aplicados.")

# Opciones de exportación
with st.expander("💾 Exportar datos filtrados"):
    col1, col2 = st.columns(2)
    with col1:
        export_format = st.radio(
            "Formato de exportación",
            ["CSV", "Excel", "JSON"],
            horizontal=True
        )
    with col2:
        if export_format == "CSV":
            export_data = filtered_df.to_csv(index=False).encode('utf-8')
            file_ext = "csv"
            mime = "text/csv"
        elif export_format == "Excel":
            # Para Excel usamos un workaround ya que streamlit no lo soporta directamente
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
                filtered_df.to_excel(writer, index=False)
            export_data = output.getvalue()
            file_ext = "xlsx"
            mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        else:  # JSON
            export_data = filtered_df.to_json(orient='records').encode('utf-8')
            file_ext = "json"
            mime = "application/json"
        
        st.download_button(
            label=f"📥 Descargar como {export_format}",
            data=export_data,
            file_name=f"{selected_file.split('.')[0]}_export.{file_ext.lower()}",
            mime=mime,
            use_container_width=True
        )

# Pie de página con información adicional
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #888; padding: 20px;">
    <p>Dashboard generado por CSV Analyzer Pro</p>
    <p>Los datos mostrados pueden contener valores aproximados en los cálculos estadísticos</p>
</div>
""", unsafe_allow_html=True)