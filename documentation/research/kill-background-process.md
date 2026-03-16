# How to kill background processes

Like the flask server script running in the background.

## Command line

- show processes: `ps`
- show what processes use port 5000: `lsof -i :5000`
- find running python processes: `ps aux | grep python`
- kill process 1234: `pkill -g 1234`
