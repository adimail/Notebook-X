import jupyter_client


class KernelManager:
    def __init__(self):
        self.kernels = {}

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
