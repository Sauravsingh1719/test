"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

export default function StudentTestList() {
  const [tests, setTests] = useState<any[]>([]);
  useEffect(() => {
    axios.get("/api/test/public")
      .then(r => { if (r.data?.success) setTests(r.data.data); })
      .catch(e => console.error(e));
  }, []);

  return (
    <div className="space-y-4">
      {tests.map(t => (
        <div key={t._id} className="p-4 border rounded">
          <h3 className="text-lg font-semibold"><Link href={`/test/${t._id}`}>{t.title}</Link></h3>
          <p className="text-sm text-muted-foreground">{t.category?.name} • {t.createdBy?.name}</p>
          <div className="text-sm mt-2">Duration: {t.duration} minutes</div>
        </div>
      ))}
    </div>
  );
}
