# How to kill background processes

Like the flask server script (server.py) running in the background after a VS Code crash.

## Command line

- show all processes: `top` (type `q` to exit)
- show what processes use port 5000: `lsof -i :5000`
- find running python processes: `ps aux | grep python`
- find \*server.py processes: `ps -o pid,args | grep server.py | grep -v grep`
- kill unresponsive process with PID 1234: `kill -9 1234`

## More help

[Reddit](https://www.reddit.com/r/linux/comments/19884er/best_way_to_effectively_kill_a_process/)
