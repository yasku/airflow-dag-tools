from airflow.operators.oracle_operator import OracleOperator
from airflow.models import Variable
from pathlib import Path
from airflow.hooks.oracle_hook import OracleHook
import psycopg2
from airflow.providers.postgres.hooks.postgres import PostgresHook
from airflow.hooks.base import BaseHook
from airflow.providers.postgres.operators.postgres import PostgresOperator
from airflow.models.connection import Connection

"""
Modulo de funciones para PostgreSQL.
Utilizar la funcion postgress_connection() con el conn_id establecido en airflow para extraer el string de conexion para utilizar con distintos metodos.
Sino, tambien puede extraer los datos de conexion para utilizar a gusto con las otras funciones

Version 1: Agustin Yaskuloski. 10/10/2023
    
"""

class Run_Postgres:
    
    def get_postgres_connection_params(conn_id):
        """Obtiene los datos de una conexion PostgreSQL que se encuentre cargada en airflos

        Args:
            conn_id (id_conexion): Nombre de la conexion

        Returns:
            host: host de la conexion
            port: puerto de la conexion
            schema: bd de la conexion
            username: usuario de la conexion
            password: password de la conexion
        """        
        conn = Connection.get_connection_from_secrets(conn_id)
        conn_params = {
        'host': conn.host,
        'port': conn.port,
        'schema': conn.schema,
        'username': conn.login,
        'password': conn.password
        }
        return conn_params
    
    def postgres_connection(conn_id):
        """Devuelve el string de conexion de postgre a partir del conn_id cargado en airflow

        Args:
            conn_id (conn_id): nombre de la conexion

        Returns:
            connection: string de conexion
        """        

        params = Run_Postgres.get_postgres_connection_params(conn_id)
        connection = psycopg2.connect(user=params["username"],password=params["password"],port=params["port"],
                                        database=params["schema"],host=params["host"])
        return connection
 
 
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
 