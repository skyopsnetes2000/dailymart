
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminShopsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Shops</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This section will allow you to add, edit, and manage your shop locations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Check back later for full functionality!</p>
        </CardContent>
      </Card>
    </div>
  );
}
