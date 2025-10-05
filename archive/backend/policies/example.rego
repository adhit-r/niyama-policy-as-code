package niyama.policies

# Example policy for demonstration
default allow = false

allow {
    input.user.role == "admin"
}

allow {
    input.user.role == "user"
    input.action == "read"
}
