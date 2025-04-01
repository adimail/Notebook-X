import jupyter_client
import zmq


class KernelManager:
    def __init__(self):
        self.kernels = {}
        self.context = zmq.Context.instance()

    def __del__(self):
        """Ensure proper cleanup when the KernelManager is destroyed."""
        for kernel_id in list(self.kernels.keys()):
            self.shutdown_kernel(kernel_id)

        try:
            self.context.destroy(linger=0)
        except Exception as e:
            print(f"Error destroying ZMQ context: {e}")

    def start_kernel(self):
        km = jupyter_client.KernelManager()
        km.start_kernel()
        kernel_id = km.kernel_id
        self.kernels[kernel_id] = km
        return kernel_id

    def get_kernel_manager(self, kernel_id):
        return self.kernels.get(kernel_id)

    def shutdown_kernel(self, kernel_id):
        km = self.kernels.get(kernel_id)
        if km:
            km.shutdown_kernel()
            del self.kernels[kernel_id]
            return True
        return False
