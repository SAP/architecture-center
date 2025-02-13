#!/bin/zsh

# Function to delete .drawio.bkp files
delete_drawio_backup_files() {
    local directory=$1

    # Check if directory is provided
    if [[ -z "$directory" ]]; then
        echo "Usage: $0 <directory_path>"
        return 1
    fi

    # Expand the tilde to the home directory
    directory=$(eval echo "$directory")

    # Find and delete .drawio.bkp files in the directory and its subdirectories
    find "$directory" -type f -name "*.drawio.bkp" -exec rm {} \; -print
}

# Specify the directory where you want to delete the files
directory_path="~/architecture-center/docs/ref-arch"

# Call the function to delete the files
delete_drawio_backup_files "$directory_path"
