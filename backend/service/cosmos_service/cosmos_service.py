import os
import logging

import azure.cosmos.cosmos_client as CosmosClient

COSMOSDB_URI = os.getenv('COSMOSDB_URI')
COSMOSDB_KEY = os.getenv('COSMOSDB_KEY')
DATABASE_NAME = os.getenv('COSMOSDB_DATABASE_NAME')
CONTAINER_NAME = os.getenv('COSMOSDB_CONTAINER_NAME')

# cosmosDB用のクラス
class CosmosService:
    def __init__(self):
        self.client = CosmosClient.CosmosClient(COSMOSDB_URI, {'masterKey': COSMOSDB_KEY})
        self.database = self.client.get_database_client(DATABASE_NAME)
        self.container = self.database.get_container_client(CONTAINER_NAME)
        logging.info(f"Connected to CosmosDB: {COSMOSDB_URI}")

    def insert_data(self, data):
        self.container.upsert_item(data)
        logging.info(f"Inserted data into CosmosDB: {data}")
        
    def get_data(self, query):
        items = list(self.container.query_items(query=query, enable_cross_partition_query=True))
        logging.info(f"Got data from CosmosDB: {items}")
        return items

    def delete_data(self, item_id):
        return self.container.delete_item(item=item_id, partition_key=item_id)

    def update_data(self, query, data):
        items = list(self.container.query_items(query=query, enable_cross_partition_query=True))
        for item in items:
            self.container.replace_item(item, data)
        logging.info(f"Updated data in CosmosDB: {items}")
        return items