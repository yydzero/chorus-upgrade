class RenameGpdbSchemasToSchemas < ActiveRecord::Migration
  def up
    rename_table :gpdb_schemas, :schemas
    rename_column :schemas, :database_id, :parent_id
    add_column :schemas, :parent_type, :string, :null => false, :default => 'GpdbDatabase'
    add_column :schemas, :type, :string, :null => false, :default => 'GpdbSchema'
    change_column_default :schemas, :parent_type, nil
    change_column_default :schemas, :type, nil
  end

  def down
    remove_column :schemas, :type
    remove_column :schemas, :parent_type
    rename_column :schemas, :parent_id, :database_id
    rename_table :schemas, :gpdb_schemas
  end
end
