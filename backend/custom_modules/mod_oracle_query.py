"""
Modulo Oracle Query parametrizable
"""

from airflow.models import Variable
from pathlib import Path
from airflow.hooks.oracle_hook import OracleHook
import psycopg2
import cx_Oracle as cx_Oracle
from airflow.hooks.base import BaseHook
class Run_Oracle:
    def path_or_string(str_or_path):
        """Load file contents as string or return input str."""
        file_path = Path(str_or_path)
        if file_path.exists():
            with file_path.open('r') as f:
                return f.read()
        print(str_or_path)
        return str_or_path

    """
        metodo que realiza la ejecucion de una sentencia sql de oracle
        parametros:
            nom_task: nombre de la tarea
            files: nombre del archivo a ejecutar
            connection_id: conexion a la base de datos
            carpeta: directorio donde se encuentra el archivo
            parametros: parametros importados del dag
        return
            select_etl: el operador a ejecutar en el dag
    """ 
    def generate_etl_operation(nom_task, files, connection_id, carpeta, parametros):
        sql_files_path = Variable.get('{carpeta}'.format(carpeta=carpeta))
        ETL_SQL = sql_files_path+'/'+'{files}'.format(files=files)
        select_etl = OracleOperator(
            task_id='{t}'.format(t=nom_task),
            oracle_conn_id='{conexion}'.format(conexion=connection_id),
            sql=Run_Oracle.path_or_string(ETL_SQL),
            depends_on_past=True,
            wait_for_downstream=True,
            autocommit=True,
            params=parametros)
        return select_etl

    """
        metodo que realiza la ejecucion de una sentencia sql de oracle
        parametros:
            nom_task: nombre de la tarea 
            sql_query: indica la consulta sql a realizar
            connection_id: conexion a la base de datos
        return
            select_etl: el operador a ejecutar en el dag
    """
    def generate_etl_query(nom_task, sql_query, connection_id):
        select_etl = OracleOperator(
            task_id='{t}'.format(t=nom_task),
            oracle_conn_id='{conexion}'.format(conexion=connection_id),
            sql=sql_query,
            depends_on_past=True,
            wait_for_downstream=True,
            autocommit=True)
        return select_etl

    """
        metodo que realiza la ejecucion de una sentencia sql de oracle
        parametros:
            sql_query: indica la consulta sql a realizar
            connection_id: conexion a la base de datos
        return
            result: la respuesta a la consulta realizada
    """
    def execute_query(sql_query, connection_id):
        oracle_hook = OracleHook(oracle_conn_id=connection_id)
        cn = oracle_hook.get_conn()
        cur=cn.cursor()
        print('Consulta realizada: ' + sql_query)
        cur.execute(sql_query)
        result = cur.fetchall()
        del cur
        cn.close()
        return result

    """
        Metodo que inserta el dataframe en la tabla de oracle dinamicamente.
        Parametros: 
            dataframe: datos del dataframe que se desea insertar
            tabla: tabla final donde se insertaran los datos
            connection_id: conexion a la base de datos
        return: Insert de dataframe.	
    """
    def insert_dataframe_oracle(df_fin, table, connection_id, partition_size=100000):
        oracle_hook = OracleHook(oracle_conn_id=connection_id)
        connection = oracle_hook.get_conn()
        
        columns = ', '.join(df_fin.columns)
        values = ', '.join([':' + str(i + 1) for i in range(len(df_fin.columns))])
        table_name = table

        # Convierto la lista de valores en tupla para poder insertarla en la tabla
        data = [tuple(row) for row in df_fin.values]

        # Creo la sentencia de insert en base a las variables 
        insert_query = f"INSERT INTO {table_name} VALUES ({','.join([':' + str(i + 1) for i in range(len(df_fin.columns))])})"

        # Traigo la conexion, creo el cursor y ejecuto el insert.
        cursor = connection.cursor()
        if len(data) > partition_size:
            start_pos = 0
            partition_q = int(df_fin.shape[0]/partition_size)
            print('Se divide el dataframe en {0} partes'.format(partition_q))
            while start_pos < len(data):
                data_part = data[start_pos:start_pos + partition_size]
                start_pos += partition_size
                cursor.executemany(insert_query, data_part)
        else:
            cursor.executemany(insert_query, data)

        # Commit y close.
        connection.commit()
        cursor.close()
        connection.close()

        print(f"Se insertaron {len(data)} filas en la tabla {table_name}.")

        
    """
        Metodo que inserta el dataframe en la tabla de oracle dinamicamente.
        Parametros: 
            dataframe: datos del dataframe que se desea insertar
            tabla: tabla final donde se insertaran los datos
            connection_id: conexion a la base de datos
            partition_size: tamaÃ±o maximo de particion
        return: Insert de dataframe.	
    """
    def insert_dataframe_oracle2(df_fin, table, connection_id, partition_size=100000):
        oracle_hook = OracleHook(oracle_conn_id=connection_id)
        connection = oracle_hook.get_conn()
        
        columns = ', '.join(df_fin.columns)
        values = ', '.join([':' + str(i + 1) for i in range(len(df_fin.columns))])
        table_name = table

        # Convierto la lista de valores en tupla para poder insertarla en la tabla
        data = [tuple(row) for row in df_fin.values]

        # Creo la sentencia de insert en base a las variables 
        insert_query = f"INSERT INTO {table_name} VALUES ({','.join([':' + str(i + 1) for i in range(len(df_fin.columns))])})"

        # Traigo la conexion, creo el cursor y ejecuto el insert.
        cursor = connection.cursor()
        if len(data) > partition_size:
            start_pos = 0
            partition_q = int(df_fin.shape[0]/partition_size)
            print('Se divide el dataframe en {0} partes'.format(partition_q))
            while start_pos < len(data):
                data_part = data[start_pos:start_pos + partition_size]
                start_pos += partition_size
                cursor.executemany(insert_query, data_part)
        else:
            cursor.executemany(insert_query, data)

        # Commit y close.
        connection.commit()
        cursor.close()
        connection.close()

        print(f"Se insertaron {len(data)} filas en la tabla {table_name}.")

    
    ## Metodo que obtiene los parametros de conexion a la base de datos
    def get_conection_params(connection_id):
        ps = {}
        conn = BaseHook.get_connection(connection_id)
        print(type(conn))
        print(conn.conn_type)
        ps['username'] = conn.login
        ps['password'] = conn.password
        ps['host'] = conn.host
        ps['port'] = conn.port
        ps['schema'] = conn.schema
        ps['conn_type']= conn.conn_type
        #ps['password_file'] = conn.extra_dejson['password_file']
        return ps
        
    ### Argumentos de conexion a Oracle
    def oracle_connection():

        oracle_username = 'dracing'
        oracle_password = 'dwrac01'
        oracle_host = 'exa1-scan.claro.amx'
        oracle_port = '1521'
        oracle_service_name = 'RAC8.WORLD'

        # Construccion del string de coneccion
        dsn = cx_Oracle.makedsn(oracle_host, oracle_port, service_name=oracle_service_name)
        connection = cx_Oracle.connect(oracle_username, oracle_password, dsn)
        return connection
    
    def oracle_connection_fwa(conn_id):
        
        params = Run_Oracle.get_conection_params(conn_id)
        dsn_tns = cx_Oracle.makedsn(params['host'],params['port'],service_name=params['schema'])
        connection = cx_Oracle.connect(user=params['username'],password=params['password'],dsn=dsn_tns)
        return connection